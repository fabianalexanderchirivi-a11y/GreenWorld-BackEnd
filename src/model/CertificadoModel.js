import { poolPromise, sql } from "../config/db.js"

const listarCertificado = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("dbo.usp_ListarCertificados")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const insertarCertificado = async (certificado) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_inscripcion", sql.Int, certificado.id_inscripcion)
            .input("codigo_certificado", sql.NVarChar(100), certificado.codigo_certificado)
            .input("url_certificado", sql.NVarChar(255), certificado.url_certificado)
            .execute("dbo.usp_InsertarCertificado")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const editarCertificado = async (id_certificado, certificado) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_certificado", sql.Int, id_certificado)
            .input("id_inscripcion", sql.Int, certificado.id_inscripcion)
            .input("codigo_certificado", sql.NVarChar(100), certificado.codigo_certificado)
            .input("url_certificado", sql.NVarChar(255), certificado.url_certificado)
            .execute("dbo.usp_EditarCertificado")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const eliminarCertificado = async (id_certificado) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_certificado", sql.Int, id_certificado)
            .execute("dbo.usp_EliminarCertificado")

        return result.recordset
    } catch (error) {
        throw error
    }
}

export { listarCertificado, insertarCertificado, editarCertificado, eliminarCertificado }
