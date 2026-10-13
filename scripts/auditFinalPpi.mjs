import { config } from 'dotenv'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

config({ quiet: true })
const { poolPromise, sql } = await import('../src/config/db.js')
const output = path.resolve(process.env.GW_EVIDENCE_DIR || '../frontend/cypress/evidence/final-20261009')
const privateFile = path.resolve('../frontend/cypress/evidence/private/.env.final')
const base = 'http://127.0.0.1:4000/api'
const request = async (method, route, token, body) => {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return { status: response.status, data: await response.json() }
}

try {
  const pool = await poolPromise
  const schema = await pool.request().query(`
    SELECT TABLE_NAME,COLUMN_NAME,DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME IN ('modulos','inscripciones','progreso_modulos')
    ORDER BY TABLE_NAME,ORDINAL_POSITION;
    SELECT OBJECT_ID('dbo.progreso_modulos') AS progreso_modulos_object_id;
    SELECT c.id_curso,c.titulo,c.estado,COUNT(m.id_modulo) AS modulos,
           SUM(CASE WHEN NULLIF(LTRIM(RTRIM(m.contenido)), '') IS NOT NULL THEN 1 ELSE 0 END) AS modulos_con_contenido
    FROM dbo.cursos c LEFT JOIN dbo.modulos m ON m.id_curso=c.id_curso
    GROUP BY c.id_curso,c.titulo,c.estado ORDER BY c.id_curso;
    SELECT name,OBJECT_DEFINITION(object_id) AS definicion FROM sys.procedures
    WHERE name IN ('usp_ActualizarProgresoModulo','usp_RecalcularProgresoInscripcion','usp_ObtenerProgresoCurso');
  `)
  await mkdir(output, { recursive: true })
  await writeFile(path.join(output, 'auditoria-esquema-modulos.json'), JSON.stringify({
    fecha: new Date().toISOString(), columnas: schema.recordsets[0],
    tabla_progreso: schema.recordsets[1][0], cursos: schema.recordsets[2],
    procedimientos: schema.recordsets[3],
  }, null, 2))

  const correo = `ppi-final-${randomUUID()}@example.test`
  const contrasena = randomBytes(24).toString('base64url')
  const registered = await request('POST', '/auth/register', null, {
    nombre: 'Prueba', apellido: 'PPI Final', correo, contrasena,
  })
  if (registered.status !== 201) throw new Error(`Registro de prueba: HTTP ${registered.status}`)
  await mkdir(path.dirname(privateFile), { recursive: true })
  await writeFile(privateFile, `CYPRESS_USER_EMAIL=${correo}\nCYPRESS_USER_PASSWORD=${contrasena}\n`)
  const login = await request('POST', '/auth/login', null, { correo, contrasena })
  if (login.status !== 200) throw new Error(`Login de prueba: HTTP ${login.status}`)
  const token = login.data.token
  const courses = await request('GET', '/courses')
  const course = courses.data.data.find((item) => Number(item.id_curso) === 1) || courses.data.data[0]
  const before = await request('GET', '/usuarios/me/cursos', token)
  const complete = await request('PUT', `/cursos/${course.id_curso}/progreso`, token, { estado_progreso: 'terminado', porcentaje_avance: 100 })
  const persisted = await pool.request()
    .input('id_usuario', sql.Int, login.data.usuario.id_usuario)
    .input('id_curso', sql.Int, course.id_curso)
    .query(`SELECT id_inscripcion,id_curso,estado,progreso_general,fecha_finalizacion
            FROM dbo.inscripciones WHERE id_usuario=@id_usuario AND id_curso=@id_curso`)
  let procedureResult
  try {
    await pool.request().input('id_inscripcion', sql.Int, persisted.recordset[0].id_inscripcion)
      .execute('dbo.usp_ObtenerProgresoCurso')
    procedureResult = { ejecutado: true }
  } catch (error) {
    procedureResult = { ejecutado: false, numero_sql: error.number, mensaje: error.message }
  }
  const audit = {
    fecha: new Date().toISOString(), curso_id: course.id_curso,
    cursos_inscritos_antes: before.data.data.length,
    finalizacion_sin_iniciar_http: complete.status,
    finalizacion_respuesta: complete.data.data,
    persistencia_sql: persisted.recordset[0],
    procedimiento_progreso: procedureResult,
    conclusion: 'La API permite completar sin inicio previo ni seguimiento de módulos. El seguimiento por módulos está incompleto: falta dbo.progreso_modulos.',
  }
  await writeFile(path.join(output, 'auditoria-finalizacion-api-sql.json'), JSON.stringify(audit, null, 2))
  console.log(JSON.stringify({ registro_http: registered.status, login_http: login.status, curso_id: course.id_curso,
    finalizacion_sin_iniciar_http: complete.status, estado_sql: persisted.recordset[0]?.estado,
    tabla_progreso_modulos: schema.recordsets[1][0].progreso_modulos_object_id,
    procedimiento_sql_error: procedureResult.numero_sql }, null, 2))
} finally {
  const pool = await poolPromise
  await pool.close()
}
