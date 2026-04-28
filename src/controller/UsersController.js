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

        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: "Correo y contrasena son obligatorios"
            })
        }

        const usuario = await buscarUsuarioPorCorreo(correo)

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: "Correo o contrasena incorrectos"
            })
        }

        if (usuario.estado?.toLowerCase() !== "activo") {
            return res.status(403).json({
                success: false,
                message: "El usuario no esta activo"
            })
        }

        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena)

        if (!contrasenaValida) {
            return res.status(401).json({
                success: false,
                message: "Correo o contrasena incorrectos"
            })
        }

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
        return res.status(500).json({
            success: false,
            message: "Error en el servidor",
            error: error.message
        })
    }
}

export { getUsers, loginUser }
