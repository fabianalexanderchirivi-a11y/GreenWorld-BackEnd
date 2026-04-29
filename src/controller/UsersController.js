import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { listarUsuarios, buscarUsuarioPorCorreo } from "../model/UsersModel.js"

const getUsers = async (req, res) => {
    try {
        const users = await listarUsuarios()

        res.status(200).json({
            success: true,
            data: users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { correo, contrasena } = req.body
        console.log("BODY RECIBIDO:", req.body)
        console.log("CORREO RECIBIDO:", correo)
        console.log("CONTRASENA RECIBIDA:", contrasena)

        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: "Correo y contrasena son obligatorios"
            })
        }

        const usuario = await buscarUsuarioPorCorreo(correo)
        console.log("USUARIO ENCONTRADO:", usuario)

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: "Correo o contrasena incorrectos"
            })
        }

        const estadoUsuario = String(usuario.estado || '').trim().toLowerCase()
        console.log("ESTADO ORIGINAL:", usuario.estado)
        console.log("ESTADO LIMPIO:", estadoUsuario)

        if (estadoUsuario !== "activo") {
            return res.status(403).json({
                success: false,
                message: "El usuario no esta activo"
            })
        }

        const hashGuardado = String(usuario.contrasena || '').trim()
        console.log("HASH GUARDADO:", hashGuardado)
        console.log("LARGO HASH:", hashGuardado.length)
        console.log("INICIO HASH:", hashGuardado.substring(0, 4))
        
        const contrasenaValida = await bcrypt.compare(contrasena, hashGuardado)
        console.log("CONTRASENA VALIDA:", contrasenaValida)

        

        if (!contrasenaValida) {
            return res.status(401).json({
                success: false,
                message: "Correo o contrasena incorrectos"
            })
        }
        console.log("JWT_SECRET EXISTE:", Boolean(process.env.JWT_SECRET))

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        )

        return res.status(200).json({
            success: true,
            message: "Inicio de sesion exitoso",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo
            }
        })
    } catch (error) {
        console.error("Error en loginUser:", error)
        return res.status(500).json({
            success: false,
            message: "Error en el servidor",
            error: error.message
        })
    }
}

export { getUsers, loginUser }
