import { poolPromise, sql } from "../config/db.js"

const listarRetos = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarRetosActivos")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const listarRetosAdmin = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarRetos")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const insertarReto = async (reto) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("titulo", sql.VarChar(150), reto.titulo)
            .input("descripcion", sql.VarChar(sql.MAX), reto.descripcion)
            .input("objetivo", sql.VarChar(sql.MAX), reto.objetivo)
            .input("dificultad", sql.VarChar(50), reto.dificultad)
            .input("categoria", sql.VarChar(100), reto.categoria)
            .input("estado", sql.VarChar(20), reto.estado)
            .input("imagen", sql.VarChar(255), reto.imagen)
            .execute("dbo.usp_InsertarReto")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const editarReto = async (id_reto, reto) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_reto", sql.Int, id_reto)
            .input("titulo", sql.VarChar(150), reto.titulo)
            .input("descripcion", sql.VarChar(sql.MAX), reto.descripcion)
            .input("objetivo", sql.VarChar(sql.MAX), reto.objetivo)
            .input("dificultad", sql.VarChar(50), reto.dificultad)
            .input("categoria", sql.VarChar(100), reto.categoria)
            .input("estado", sql.VarChar(20), reto.estado)
            .input("imagen", sql.VarChar(255), reto.imagen)
            .execute("dbo.usp_EditarReto")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const eliminarReto = async (id_reto) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_reto", sql.Int, id_reto)
            .execute("dbo.usp_EliminarReto")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const listarRetosPorUsuario = async (id_usuario) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .query(`
                SELECT
                    ur.id_usuario_reto,
                    ur.id_usuario,
                    ur.id_reto,
                    r.titulo,
                    r.descripcion,
                    r.objetivo,
                    r.dificultad,
                    r.categoria,
                    r.estado AS estado_reto,
                    r.imagen,
                    ur.estado_progreso,
                    ur.fecha_inicio,
                    ur.fecha_finalizacion,
                    ur.fecha_ultima_actividad
                FROM dbo.usuario_retos ur
                INNER JOIN dbo.retos r ON r.id_reto = ur.id_reto
                WHERE ur.id_usuario = @id_usuario
                  AND ur.estado_progreso IN ('en_progreso', 'terminado')
                ORDER BY ur.fecha_ultima_actividad DESC, ur.fecha_inicio DESC
            `)

        return result.recordset
    } catch (error) {
        throw error
    }
}

const iniciarRetoUsuario = async (id_usuario, id_reto) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("id_reto", sql.Int, id_reto)
            .query(`
                IF NOT EXISTS (
                    SELECT 1
                    FROM dbo.usuario_retos
                    WHERE id_usuario = @id_usuario AND id_reto = @id_reto
                )
                BEGIN
                    INSERT INTO dbo.usuario_retos (
                        id_usuario,
                        id_reto,
                        estado_progreso,
                        fecha_ultima_actividad
                    )
                    VALUES (
                        @id_usuario,
                        @id_reto,
                        'en_progreso',
                        SYSDATETIME()
                    );
                END
                ELSE
                BEGIN
                    UPDATE dbo.usuario_retos
                    SET
                        estado_progreso = CASE WHEN estado_progreso = 'cancelado' THEN 'en_progreso' ELSE estado_progreso END,
                        fecha_finalizacion = CASE WHEN estado_progreso = 'cancelado' THEN NULL ELSE fecha_finalizacion END,
                        fecha_ultima_actividad = SYSDATETIME()
                    WHERE id_usuario = @id_usuario AND id_reto = @id_reto;
                END;

                SELECT TOP 1
                    id_usuario_reto,
                    id_usuario,
                    id_reto,
                    estado_progreso,
                    fecha_inicio,
                    fecha_finalizacion,
                    fecha_ultima_actividad
                FROM dbo.usuario_retos
                WHERE id_usuario = @id_usuario AND id_reto = @id_reto;
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

const terminarRetoUsuario = async (id_usuario, id_reto) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("id_reto", sql.Int, id_reto)
            .query(`
                IF NOT EXISTS (
                    SELECT 1
                    FROM dbo.usuario_retos
                    WHERE id_usuario = @id_usuario AND id_reto = @id_reto
                )
                BEGIN
                    INSERT INTO dbo.usuario_retos (
                        id_usuario,
                        id_reto,
                        estado_progreso,
                        fecha_finalizacion,
                        fecha_ultima_actividad
                    )
                    VALUES (
                        @id_usuario,
                        @id_reto,
                        'terminado',
                        SYSDATETIME(),
                        SYSDATETIME()
                    );
                END
                ELSE
                BEGIN
                    UPDATE dbo.usuario_retos
                    SET
                        estado_progreso = 'terminado',
                        fecha_finalizacion = COALESCE(fecha_finalizacion, SYSDATETIME()),
                        fecha_ultima_actividad = SYSDATETIME()
                    WHERE id_usuario = @id_usuario AND id_reto = @id_reto;
                END;

                SELECT TOP 1
                    id_usuario_reto,
                    id_usuario,
                    id_reto,
                    estado_progreso,
                    fecha_inicio,
                    fecha_finalizacion,
                    fecha_ultima_actividad
                FROM dbo.usuario_retos
                WHERE id_usuario = @id_usuario AND id_reto = @id_reto;
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

const cancelarRetoUsuario = async (id_usuario, id_reto) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("id_reto", sql.Int, id_reto)
            .query(`
                UPDATE dbo.usuario_retos
                SET
                    estado_progreso = 'cancelado',
                    fecha_finalizacion = NULL,
                    fecha_ultima_actividad = SYSDATETIME()
                WHERE id_usuario = @id_usuario
                  AND id_reto = @id_reto
                  AND estado_progreso = 'en_progreso';

                SELECT TOP 1
                    id_usuario_reto,
                    id_usuario,
                    id_reto,
                    estado_progreso,
                    fecha_inicio,
                    fecha_finalizacion,
                    fecha_ultima_actividad
                FROM dbo.usuario_retos
                WHERE id_usuario = @id_usuario AND id_reto = @id_reto;
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

export {
    listarRetos,
    listarRetosAdmin,
    insertarReto,
    editarReto,
    eliminarReto,
    listarRetosPorUsuario,
    iniciarRetoUsuario,
    terminarRetoUsuario,
    cancelarRetoUsuario
}
