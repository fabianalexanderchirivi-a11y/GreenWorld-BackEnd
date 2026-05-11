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
                FROM usuarios
                WHERE correo = @correo
            `)

        return result.recordset[0] || null
    } catch (error) {
        throw error
    }
}
const insertarU= async(user) =>{
    const{nombre,apellido,correo,contraseña,estado}=user

    try {
        const con= await
        await con.request()
        .input('nombre',sql.VarChar,nombre)
        .input('apellido',sql.VarChar,apellido)
        .input('correo',sql.VarChar,correo)
        .input('contraseña',sql.VarChar,contraseña)
        .input('estado',sql.VarChar,estado)
        .execute(dbo.usp_InsertarUsuario)
        


    } catch (error) {
        console.log(error)
        
    }
}
const eliminarU = async(user) =>{
    const {codigo}= user
    try {
        const con=await poolPromise
        await con.request()
        .input('codigo',sql.Int,codigo)
        .execute('sp_eliminar')
    } catch (error) {
        console.log(error)
        
    }
}


const editarU= async(user)=>{
    const{codigo,nombre}=ciudad
    try {
        const con= await poolPromise
        await con.request()
        .input('codigo',sql.Int,codigo)
        .input('nombre',sql.VarChar,nombre)
        .execute('editar_usuarios')


    } catch (error) {
        
    }
}
export { listarUsuarios, buscarUsuarioPorCorreo,insertarU,eliminarU,editarU}

