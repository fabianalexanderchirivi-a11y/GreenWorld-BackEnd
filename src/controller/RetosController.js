import {
    listarRetos,
    listarRetosAdmin,
    insertarReto,
    editarReto,
    eliminarReto,
    listarRetosPorUsuario,
    iniciarRetoUsuario,
    terminarRetoUsuario,
    cancelarRetoUsuario
} from "../model/RetosModel.js"

const obtenerMensajeError = (error) => (
    error.originalError?.info?.message ||
    error.precedingErrors?.[0]?.originalError?.info?.message ||
    error.message
)

const esNoEncontrado = (mensaje) => /no existe|no encontrado|not found/i.test(mensaje || "")

const validarId = (id, nombreCampo) => {
    const valor = Number(id)

    if (!Number.isInteger(valor) || valor <= 0) {
        return { error: `El ${nombreCampo} no es valido` }
    }

    return { valor }
}

const prepararReto = (body) => {
    const reto = {
        titulo: body.titulo?.trim(),
        descripcion: body.descripcion?.trim(),
        objetivo: body.objetivo?.trim() || null,
        dificultad: body.dificultad?.trim() || null,
        categoria: body.categoria?.trim() || null,
        estado: body.estado?.trim() || "activo",
        imagen: body.imagen?.trim() || null
    }

    const faltantes = Object.entries(reto)
        .filter(([key, value]) => ["titulo", "descripcion"].includes(key) && !value)
        .map(([key]) => key)

    return { reto, faltantes }
}

const getRetos = async (req, res) => {
    try {
        const retos = await listarRetos()

        return res.status(200).json({
            success: true,
            message: "Retos obtenidos correctamente",
            data: retos
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los retos",
            error: obtenerMensajeError(error)
        })
    }
}

const getRetosAdmin = async (req, res) => {
    try {
        const retos = await listarRetosAdmin()

        return res.status(200).json({
            success: true,
            message: "Retos obtenidos correctamente",
            data: retos
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los retos",
            error: obtenerMensajeError(error)
        })
    }
}

const addReto = async (req, res) => {
    try {
        const { reto, faltantes } = prepararReto(req.body)

        if (faltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos obligatorios: ${faltantes.join(", ")}`
            })
        }

        const data = await insertarReto(reto)

        return res.status(201).json({
            success: true,
            message: "Reto creado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al crear el reto",
            error: mensajeError
        })
    }
}

const updateReto = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_reto")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const { reto, faltantes } = prepararReto(req.body)

        if (faltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos obligatorios: ${faltantes.join(", ")}`
            })
        }

        const data = await editarReto(id.valor, reto)

        return res.status(200).json({
            success: true,
            message: "Reto actualizado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al actualizar el reto",
            error: mensajeError
        })
    }
}

const deleteReto = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_reto")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const data = await eliminarReto(id.valor)

        return res.status(200).json({
            success: true,
            message: "Reto desactivado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al eliminar el reto",
            error: mensajeError
        })
    }
}

const getMyRetos = async (req, res) => {
    try {
        const retos = await listarRetosPorUsuario(req.usuario.id_usuario)

        return res.status(200).json({
            success: true,
            message: "Retos del usuario obtenidos correctamente",
            data: retos
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener tus retos",
            error: obtenerMensajeError(error)
        })
    }
}

const startReto = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_reto")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const reto = await iniciarRetoUsuario(req.usuario.id_usuario, id.valor)

        return res.status(200).json({
            success: true,
            message: "Reto iniciado correctamente",
            data: reto
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al iniciar el reto",
            error: mensajeError
        })
    }
}

const finishReto = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_reto")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const reto = await terminarRetoUsuario(req.usuario.id_usuario, id.valor)

        return res.status(200).json({
            success: true,
            message: "Reto terminado correctamente",
            data: reto
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al terminar el reto",
            error: mensajeError
        })
    }
}

const cancelReto = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_reto")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const reto = await cancelarRetoUsuario(req.usuario.id_usuario, id.valor)

        return res.status(200).json({
            success: true,
            message: "Reto cancelado correctamente",
            data: reto
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al cancelar el reto",
            error: mensajeError
        })
    }
}

export {
    getRetos,
    getRetosAdmin,
    addReto,
    updateReto,
    deleteReto,
    getMyRetos,
    startReto,
    finishReto,
    cancelReto
}
