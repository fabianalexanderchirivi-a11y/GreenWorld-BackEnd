import { poolPromise } from "../config/db.js"

const listarModulos = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute('usp_ListarModulos')
        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarModulos }
