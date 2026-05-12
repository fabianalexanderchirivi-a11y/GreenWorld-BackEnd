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

export { listarInscripciones, insertarInscripcion, editarInscripcion, eliminarInscripcion }
