import { poolPromise, sql } from "../config/db.js"

const listarUsuarios = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute('usp_ListarUsuarios')
        return result.recordset
    } catch (error) {
        throw error
    }
}

const buscarUsuarioPorCorreo = async (correo) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("correo", sql.VarChar(150), correo)
            .query(`
                SELECT TOP 1
                    id_usuario,
                    nombre,
                    apellido,
                    correo,
                    contrasena,
                    estado
                FROM usuario
                WHERE correo = @correo
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

export { listarUsuarios, buscarUsuarioPorCorreo }
