import { poolPromise } from "../config/db.js"

const listarCursos = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute('usp_ListarCursos')
        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarCursos }
