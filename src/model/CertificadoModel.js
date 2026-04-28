import { poolPromise } from "../config/db.js"

const listarCertificado = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute('usp_ListarCertificados')
        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarCertificado }
