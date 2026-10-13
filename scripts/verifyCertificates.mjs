import { config } from 'dotenv'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

config({ path: path.resolve(process.env.GW_PPI_ENV_PATH || '../frontend/.env'), quiet: true })

const base = 'http://127.0.0.1:4000/api'
const output = path.resolve(process.env.GW_EVIDENCE_DIR || '../frontend/cypress/evidence')
const credentials = {
  correo: process.env.CYPRESS_USER_EMAIL,
  contrasena: process.env.CYPRESS_USER_PASSWORD,
}
if (!credentials.correo || !credentials.contrasena) throw new Error('Faltan credenciales Cypress en frontend/.env')

const request = async (method, route, token, body) => {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return { response, data: response.headers.get('content-type')?.includes('json') ? await response.json() : null }
}

const login = await request('POST', '/auth/login', null, credentials)
if (login.response.status !== 200) throw new Error(`Login: HTTP ${login.response.status}`)
const token = login.data.token
const [courses, mine] = await Promise.all([
  request('GET', '/courses', token),
  request('GET', '/usuarios/me/cursos', token),
])
const completed = mine.data.data.find((item) => item.estado_progreso === 'terminado')
const enrolled = new Set(mine.data.data.map((item) => Number(item.id_curso)))
const available = courses.data.data.find((item) => !enrolled.has(Number(item.id_curso)))
if (!completed || !available) throw new Error('Se necesita un curso terminado y otro disponible')

const results = {}
for (const route of ['/certificado', '/certificados', '/inscripciones']) {
  results[`sin_token_${route.slice(1)}`] = (await request('GET', route)).response.status
  results[`usuario_${route.slice(1)}`] = (await request('GET', route, token)).response.status
}
for (const alias of ['/certificado', '/certificados']) {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const route = method === 'POST' ? alias : `${alias}/1`
    results[`${method}_sin_token_${alias.slice(1)}`] = (await request(method, route, null, {})).response.status
    results[`${method}_usuario_${alias.slice(1)}`] = (await request(method, route, token, {})).response.status
  }
}

const courseId = available.id_curso
const start = await request('POST', `/cursos/${courseId}/iniciar`, token)
if (start.response.status !== 200) throw new Error(`Iniciar curso: HTTP ${start.response.status}`)
try {
  results.incompleto_emision = (await request('POST', `/cursos/${courseId}/certificado`, token)).response.status
  results.incompleto_sin_token = (await request('POST', `/cursos/${courseId}/certificado`)).response.status
  results.inscripcion_ajena_sin_token = (await request('POST', '/inscripciones', null, { id_curso: courseId })).response.status
} finally {
  const cancel = await request('PUT', `/cursos/${courseId}/cancelar`, token)
  if (cancel.response.status !== 200) throw new Error(`Cancelar inscripción temporal: HTTP ${cancel.response.status}`)
}

const issued = await request('POST', `/cursos/${completed.id_curso}/certificado`, token)
results.completado_emision = issued.response.status
if (![200, 201].includes(issued.response.status)) throw new Error(`Emitir completado: HTTP ${issued.response.status}`)
const certificateId = issued.data.data.id_certificado
results.id_certificado = certificateId
results.id_inscripcion = issued.data.data.id_inscripcion
results.codigo_certificado = issued.data.data.codigo_certificado
const repeated = await request('POST', `/cursos/${completed.id_curso}/certificado`, token)
results.completado_repetido = repeated.response.status
results.mismo_certificado = repeated.data.data.id_certificado === certificateId

const download = await request('GET', `/certificados/${certificateId}/descargar`, token)
results.descarga = download.response.status
results.tipo = download.response.headers.get('content-type')
const pdf = Buffer.from(await download.response.arrayBuffer())
results.firma_pdf = pdf.subarray(0, 5).toString() === '%PDF-'
results.bytes_pdf = pdf.length
const pdfPath = path.join(output, 'TC-GW08-01-certificado-real.pdf')
await mkdir(output, { recursive: true })
await writeFile(pdfPath, pdf)

results.descarga_sin_token = (await request('GET', `/certificados/${certificateId}/descargar`)).response.status
const secondaryEmail = `ppi-cert-${randomUUID()}@example.test`
const secondaryPassword = randomBytes(24).toString('base64url')
const register = await request('POST', '/auth/register', null, {
  nombre: 'Prueba', apellido: 'Certificado', correo: secondaryEmail, contrasena: secondaryPassword,
})
if (register.response.status !== 201) throw new Error(`Registrar cuenta secundaria: HTTP ${register.response.status}`)
const secondary = await request('POST', '/auth/login', null, { correo: secondaryEmail, contrasena: secondaryPassword })
if (secondary.response.status !== 200) throw new Error(`Login secundario: HTTP ${secondary.response.status}`)
try {
  results.descarga_otro_usuario = (await request('GET', `/certificados/${certificateId}/descargar`, secondary.data.token)).response.status
  results.emision_curso_otro_usuario = (await request('POST', `/cursos/${completed.id_curso}/certificado`, secondary.data.token)).response.status
} finally {
  results.cuenta_secundaria_desactivada = (await request('DELETE', '/usuarios/me', secondary.data.token)).response.status
}

const expected = {
  sin_token_certificado: 401, usuario_certificado: 403,
  sin_token_certificados: 401, usuario_certificados: 403,
  sin_token_inscripciones: 401, usuario_inscripciones: 403,
  incompleto_emision: 409, incompleto_sin_token: 401, inscripcion_ajena_sin_token: 401,
  completado_repetido: 200, descarga: 200, descarga_sin_token: 401, descarga_otro_usuario: 404,
  mismo_certificado: true, firma_pdf: true, cuenta_secundaria_desactivada: 200,
  emision_curso_otro_usuario: 404,
}
for (const alias of ['certificado', 'certificados']) {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    expected[`${method}_sin_token_${alias}`] = 401
    expected[`${method}_usuario_${alias}`] = 403
  }
}
results.verificado = Object.entries(expected).every(([key, value]) => results[key] === value)
const report = path.join(output, 'TC-GW08-api-verificacion-20261009.json')
await writeFile(report, `${JSON.stringify(results, null, 2)}\n`)
console.log(JSON.stringify(results, null, 2))
if (!results.verificado) process.exitCode = 1
