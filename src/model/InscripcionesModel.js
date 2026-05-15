import { poolPromise, sql } from "../config/db.js"

const listarInscripciones = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarInscripciones")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const insertarInscripcion = async (inscripcion) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, inscripcion.id_usuario)
            .input("id_curso", sql.Int, inscripcion.id_curso)
            .input("estado", sql.NVarChar(20), inscripcion.estado)
            .input("progreso_general", sql.Decimal(5, 2), inscripcion.progreso_general)
            .input("fecha_ultima_actividad", sql.DateTime2, inscripcion.fecha_ultima_actividad)
            .execute("dbo.usp_InsertarInscripcion")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const editarInscripcion = async (id_inscripcion, inscripcion) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_inscripcion", sql.Int, id_inscripcion)
            .input("id_usuario", sql.Int, inscripcion.id_usuario)
            .input("id_curso", sql.Int, inscripcion.id_curso)
            .input("estado", sql.NVarChar(20), inscripcion.estado)
            .input("progreso_general", sql.Decimal(5, 2), inscripcion.progreso_general)
            .input("fecha_ultima_actividad", sql.DateTime2, inscripcion.fecha_ultima_actividad)
            .execute("dbo.usp_EditarInscripcion")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const eliminarInscripcion = async (id_inscripcion) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_inscripcion", sql.Int, id_inscripcion)
            .execute("dbo.usp_EliminarInscripcion")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const listarCursosPorUsuario = async (id_usuario) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .query(`
                SELECT
                    i.id_inscripcion,
                    i.id_usuario,
                    i.id_curso,
                    c.titulo,
                    c.descripcion,
                    c.imagen,
                    c.duracion_estimada,
                    c.nivel,
                    c.categoria,
                    c.estado AS estado_curso,
                    CASE
                        WHEN i.estado = 'completado' THEN 'terminado'
                        ELSE i.estado
                    END AS estado_progreso,
                    i.progreso_general AS porcentaje_avance,
                    i.fecha_inscripcion AS fecha_inicio,
                    i.fecha_ultima_actividad,
                    i.fecha_finalizacion
                FROM dbo.inscripciones i
                INNER JOIN dbo.cursos c ON c.id_curso = i.id_curso
                WHERE i.id_usuario = @id_usuario
                  AND i.estado IN ('en_progreso', 'completado')
                ORDER BY i.fecha_ultima_actividad DESC, i.fecha_inscripcion DESC
            `)

        return result.recordset
    } catch (error) {
        throw error
    }
}

const listarInscripcionesCursosAdmin = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().query(`
            SELECT
                i.id_inscripcion,
                i.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                i.id_curso,
                c.titulo AS curso,
                CASE
                    WHEN i.estado = 'completado' THEN 'terminado'
                    ELSE i.estado
                END AS estado_progreso,
                i.progreso_general AS porcentaje_avance,
                i.fecha_inscripcion AS fecha_inicio,
                i.fecha_finalizacion,
                i.fecha_ultima_actividad
            FROM dbo.inscripciones i
            INNER JOIN dbo.usuarios u ON u.id_usuario = i.id_usuario
            INNER JOIN dbo.cursos c ON c.id_curso = i.id_curso
            ORDER BY i.fecha_ultima_actividad DESC, i.fecha_inscripcion DESC
        `)

        return result.recordset
    } catch (error) {
        throw error
    }
}

const listarInscripcionesRetosAdmin = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().query(`
            SELECT
                ur.id_usuario_reto,
                ur.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                ur.id_reto,
                r.titulo AS reto,
                ur.estado_progreso,
                ur.fecha_inicio,
                ur.fecha_finalizacion,
                ur.fecha_ultima_actividad
            FROM dbo.usuario_retos ur
            INNER JOIN dbo.usuarios u ON u.id_usuario = ur.id_usuario
            INNER JOIN dbo.retos r ON r.id_reto = ur.id_reto
            ORDER BY ur.fecha_ultima_actividad DESC, ur.fecha_inicio DESC
        `)

        return result.recordset
    } catch (error) {
        throw error
    }
}

const iniciarCursoUsuario = async (id_usuario, id_curso) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("id_curso", sql.Int, id_curso)
            .query(`
                IF NOT EXISTS (
                    SELECT 1
                    FROM dbo.inscripciones
                    WHERE id_usuario = @id_usuario AND id_curso = @id_curso
                )
                BEGIN
                    INSERT INTO dbo.inscripciones (
                        id_usuario,
                        id_curso,
                        estado,
                        progreso_general,
                        fecha_ultima_actividad
                    )
                    VALUES (
                        @id_usuario,
                        @id_curso,
                        'en_progreso',
                        0,
                        SYSDATETIME()
                    );
                END
                ELSE
                BEGIN
                    UPDATE dbo.inscripciones
                    SET
                        estado = CASE WHEN estado = 'cancelado' THEN 'en_progreso' ELSE estado END,
                        progreso_general = CASE WHEN estado = 'cancelado' THEN 0 ELSE progreso_general END,
                        fecha_ultima_actividad = SYSDATETIME(),
                        fecha_finalizacion = CASE WHEN estado = 'cancelado' THEN NULL ELSE fecha_finalizacion END
                    WHERE id_usuario = @id_usuario AND id_curso = @id_curso;
                END;

                SELECT TOP 1
                    i.id_inscripcion,
                    i.id_usuario,
                    i.id_curso,
                    CASE
                        WHEN i.estado = 'completado' THEN 'terminado'
                        ELSE i.estado
                    END AS estado_progreso,
                    i.progreso_general AS porcentaje_avance,
                    i.fecha_inscripcion AS fecha_inicio,
                    i.fecha_ultima_actividad,
                    i.fecha_finalizacion
                FROM dbo.inscripciones i
                WHERE i.id_usuario = @id_usuario AND i.id_curso = @id_curso;
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

const actualizarProgresoCursoUsuario = async (id_usuario, id_curso, progreso) => {
    const estado = progreso.estado_progreso === "terminado" ? "completado" : "en_progreso"
    const porcentaje = estado === "completado"
        ? 100
        : Number(progreso.porcentaje_avance ?? 0)

    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("id_curso", sql.Int, id_curso)
            .input("estado", sql.NVarChar(20), estado)
            .input("progreso_general", sql.Decimal(5, 2), porcentaje)
            .query(`
                IF NOT EXISTS (
                    SELECT 1
                    FROM dbo.inscripciones
                    WHERE id_usuario = @id_usuario AND id_curso = @id_curso
                )
                BEGIN
                    INSERT INTO dbo.inscripciones (
                        id_usuario,
                        id_curso,
                        estado,
                        progreso_general,
                        fecha_ultima_actividad,
                        fecha_finalizacion
                    )
                    VALUES (
                        @id_usuario,
                        @id_curso,
                        @estado,
                        @progreso_general,
                        SYSDATETIME(),
                        CASE WHEN @estado = 'completado' THEN SYSDATETIME() ELSE NULL END
                    );
                END
                ELSE
                BEGIN
                    UPDATE dbo.inscripciones
                    SET
                        estado = @estado,
                        progreso_general = @progreso_general,
                        fecha_ultima_actividad = SYSDATETIME(),
                        fecha_finalizacion = CASE WHEN @estado = 'completado' THEN SYSDATETIME() ELSE fecha_finalizacion END
                    WHERE id_usuario = @id_usuario AND id_curso = @id_curso;
                END;

                SELECT TOP 1
                    i.id_inscripcion,
                    i.id_usuario,
                    i.id_curso,
                    CASE
                        WHEN i.estado = 'completado' THEN 'terminado'
                        ELSE i.estado
                    END AS estado_progreso,
                    i.progreso_general AS porcentaje_avance,
                    i.fecha_inscripcion AS fecha_inicio,
                    i.fecha_ultima_actividad,
                    i.fecha_finalizacion
                FROM dbo.inscripciones i
                WHERE i.id_usuario = @id_usuario AND i.id_curso = @id_curso;
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

const cancelarCursoUsuario = async (id_usuario, id_curso) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("id_curso", sql.Int, id_curso)
            .query(`
                UPDATE dbo.inscripciones
                SET
                    estado = 'cancelado',
                    progreso_general = 0,
                    fecha_ultima_actividad = SYSDATETIME(),
                    fecha_finalizacion = NULL
                WHERE id_usuario = @id_usuario
                  AND id_curso = @id_curso
                  AND estado = 'en_progreso';

                SELECT TOP 1
                    i.id_inscripcion,
                    i.id_usuario,
                    i.id_curso,
                    CASE
                        WHEN i.estado = 'completado' THEN 'terminado'
                        ELSE i.estado
                    END AS estado_progreso,
                    i.progreso_general AS porcentaje_avance,
                    i.fecha_inscripcion AS fecha_inicio,
                    i.fecha_ultima_actividad,
                    i.fecha_finalizacion
                FROM dbo.inscripciones i
                WHERE i.id_usuario = @id_usuario AND i.id_curso = @id_curso;
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

export {
    listarInscripciones,
    insertarInscripcion,
    editarInscripcion,
    eliminarInscripcion,
    listarCursosPorUsuario,
    listarInscripcionesCursosAdmin,
    listarInscripcionesRetosAdmin,
    iniciarCursoUsuario,
    actualizarProgresoCursoUsuario,
    cancelarCursoUsuario
}
