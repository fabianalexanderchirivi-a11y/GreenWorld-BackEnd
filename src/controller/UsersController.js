import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {
    listarUsuarios,
    buscarUsuarioPorCorreo,
    insertarUsuario,
    editarUsuario,
    eliminarUsuario
} from "../model/UsersModel.js"

const obtenerMensajeError = (error) => (
    error.originalError?.info?.message ||
    error.precedingErrors?.[0]?.originalError?.info?.message ||
    error.message
)

const getUsers = async (req, res) => {
    try {
        const users = await listarUsuarios()

        return res.status(200).json({
            success: true,
            data: users
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: obtenerMensajeError(error)
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { correo, contrasena } = req.body
        const correoLimpio = correo?.trim()

        if (!correoLimpio || !contrasena) {
            return res.status(400).json({
                success: false,
                message: "Correo y contrasena son obligatorios"
            })
        }

        const usuario = await buscarUsuarioPorCorreo(correoLimpio)

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: "Correo o contrasena incorrectos"
            })
        }

        const estadoUsuario = String(usuario.estado || "").trim().toLowerCase()

        if (estadoUsuario !== "activo") {
            return res.status(403).json({
                success: false,
                message: "El usuario no esta activo"
            })
        }

        const hashGuardado = String(usuario.contrasena || "").trim()
        const contrasenaValida = await bcrypt.compare(contrasena, hashGuardado)

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
            error: obtenerMensajeError(error)
        })
    }
}

const addUser = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena } = req.body
        const datosUsuario = {
            nombre: nombre?.trim(),
            apellido: apellido?.trim(),
            correo: correo?.trim(),
            contrasena
        }

        if (!datosUsuario.nombre || !datosUsuario.apellido || !datosUsuario.correo || !datosUsuario.contrasena) {
            return res.status(400).json({
                success: false,
                message: "Nombre, apellido, correo y contrasena son obligatorios"
            })
        }

        if (datosUsuario.contrasena.length < 8) {
            return res.status(400).json({
                success: false,
                message: "La contrasena debe tener minimo 8 caracteres"
            })
        }

        const usuarioExistente = await buscarUsuarioPorCorreo(datosUsuario.correo)

        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un usuario registrado con ese correo"
            })
        }

        const contrasenaEncriptada = await bcrypt.hash(datosUsuario.contrasena, 10)

        await insertarUsuario({
            nombre: datosUsuario.nombre,
            apellido: datosUsuario.apellido,
            correo: datosUsuario.correo,
            contrasena: contrasenaEncriptada
        })

        return res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente"
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al registrar usuario",
            error: mensajeError
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id)
        const { nombre, apellido, correo, contrasena } = req.body

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            return res.status(400).json({
                success: false,
                message: "El id_usuario no es valido"
            })
        }

        if (!nombre?.trim() && !apellido?.trim() && !correo?.trim() && !contrasena) {
            return res.status(400).json({
                success: false,
                message: "Debes enviar al menos un campo para actualizar"
            })
        }

        const contrasenaEncriptada = contrasena
            ? await bcrypt.hash(contrasena, 10)
            : null

        await editarUsuario(id_usuario, {
            nombre,
            apellido,
            correo,
            contrasena: contrasenaEncriptada
        })

        return res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente"
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al actualizar usuario",
            error: mensajeError
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const id_usuario = Number(req.params.id)

        if (!Number.isInteger(id_usuario) || id_usuario <= 0) {
            return res.status(400).json({
                success: false,
                message: "El id_usuario no es valido"
            })
        }

        await eliminarUsuario(id_usuario)

        return res.status(200).json({
            success: true,
            message: "Usuario eliminado o desactivado correctamente"
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al eliminar usuario",
            error: mensajeError
        })
    }
}

export { getUsers, loginUser, addUser, updateUser, deleteUser }
