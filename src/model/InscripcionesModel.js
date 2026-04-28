import { poolPromise } from "../config/db.js"

const listarInscripciones = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute('usp_ListarInscripciones')
        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarInscripciones }
