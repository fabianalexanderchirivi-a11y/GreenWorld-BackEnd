import { poolPromise, sql } from "../config/db.js"

const listarCursos = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarCursos")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const listarCursosAdmin = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarCursos")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const insertarCurso = async (curso) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("titulo", sql.NVarChar(150), curso.titulo)
            .input("descripcion", sql.NVarChar(sql.MAX), curso.descripcion)
            .input("imagen", sql.NVarChar(255), curso.imagen)
            .input("duracion_estimada", sql.NVarChar(50), curso.duracion_estimada)
            .input("nivel", sql.NVarChar(20), curso.nivel)
            .input("categoria", sql.NVarChar(100), curso.categoria)
            .input("estado", sql.NVarChar(20), curso.estado)
            .execute("dbo.usp_InsertarCurso")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const editarCurso = async (id_curso, curso) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_curso", sql.Int, id_curso)
            .input("titulo", sql.NVarChar(150), curso.titulo)
            .input("descripcion", sql.NVarChar(sql.MAX), curso.descripcion)
            .input("imagen", sql.NVarChar(255), curso.imagen)
            .input("duracion_estimada", sql.NVarChar(50), curso.duracion_estimada)
            .input("nivel", sql.NVarChar(20), curso.nivel)
            .input("categoria", sql.NVarChar(100), curso.categoria)
            .input("estado", sql.NVarChar(20), curso.estado)
            .execute("dbo.usp_EditarCurso")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const eliminarCurso = async (id_curso) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_curso", sql.Int, id_curso)
            .execute("dbo.usp_EliminarCurso")

        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarCursos, listarCursosAdmin, insertarCurso, editarCurso, eliminarCurso }
