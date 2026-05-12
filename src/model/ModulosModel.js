import { poolPromise, sql } from "../config/db.js"

const listarModulos = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarModulos")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const insertarModulo = async (modulo) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_curso", sql.Int, modulo.id_curso)
            .input("titulo", sql.NVarChar(150), modulo.titulo)
            .input("descripcion", sql.NVarChar(sql.MAX), modulo.descripcion)
            .input("contenido", sql.NVarChar(sql.MAX), modulo.contenido)
            .input("video_url", sql.NVarChar(255), modulo.video_url)
            .input("orden_modulo", sql.Int, modulo.orden_modulo)
            .input("duracion_estimada", sql.NVarChar(50), modulo.duracion_estimada)
            .input("estado", sql.NVarChar(20), modulo.estado)
            .execute("dbo.usp_InsertarModulo")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const editarModulo = async (id_modulo, modulo) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_modulo", sql.Int, id_modulo)
            .input("id_curso", sql.Int, modulo.id_curso)
            .input("titulo", sql.NVarChar(150), modulo.titulo)
            .input("descripcion", sql.NVarChar(sql.MAX), modulo.descripcion)
            .input("contenido", sql.NVarChar(sql.MAX), modulo.contenido)
            .input("video_url", sql.NVarChar(255), modulo.video_url)
            .input("orden_modulo", sql.Int, modulo.orden_modulo)
            .input("duracion_estimada", sql.NVarChar(50), modulo.duracion_estimada)
            .input("estado", sql.NVarChar(20), modulo.estado)
            .execute("dbo.usp_EditarModulo")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const eliminarModulo = async (id_modulo) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_modulo", sql.Int, id_modulo)
            .execute("dbo.usp_EliminarModulo")

        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarModulos, insertarModulo, editarModulo, eliminarModulo }
