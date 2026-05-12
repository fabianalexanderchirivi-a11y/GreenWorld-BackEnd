import { poolPromise, sql } from "../config/db.js"

const listarUsuarios = async () => {
    try {
        const con = await poolPromise
        const result = await con.request().execute("usp_ListarUsuarios")
        return result.recordset
    } catch (error) {
        throw error
    }
}

const buscarUsuarioPorCorreo = async (correo) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("correo", sql.VarChar(150), correo.trim())
            .query(`
                SELECT TOP 1
                    id_usuario,
                    nombre,
                    apellido,
                    correo,
                    contrasena,
                    estado
                FROM usuarios
                WHERE correo = @correo
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}

const insertarUsuario = async (user) => {
    const { nombre, apellido, correo, contrasena } = user

    try {
        const con = await poolPromise
        const result = await con.request()
            .input("nombre", sql.VarChar(100), nombre.trim())
            .input("apellido", sql.VarChar(100), apellido.trim())
            .input("correo", sql.VarChar(150), correo.trim())
            .input("contrasena", sql.VarChar(255), contrasena)
            .input("estado", sql.VarChar(20), "Activo")
            .execute("dbo.usp_InsertarUsuario")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const editarUsuario = async (id_usuario, user) => {
    const { nombre, apellido, correo = null, contrasena = null } = user

    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("nombre", sql.VarChar(100), nombre?.trim() || null)
            .input("apellido", sql.VarChar(100), apellido?.trim() || null)
            .input("correo", sql.VarChar(150), correo?.trim() || null)
            .input("contrasena", sql.VarChar(255), contrasena)
            .execute("dbo.usp_EditarPerfilUsuario")

        return result.recordset
    } catch (error) {
        throw error
    }
}

const eliminarUsuario = async (id_usuario) => {
    try {
        const con = await poolPromise
        const result = await con.request()
            .input("id_usuario", sql.Int, id_usuario)
            .execute("dbo.usp_EliminarUsuario")

        return result.recordset
    } catch (error) {
        throw error
    }
}

export {
    listarUsuarios,
    buscarUsuarioPorCorreo,
    insertarUsuario,
    editarUsuario,
    eliminarUsuario
}
