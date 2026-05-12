import {
    listarModulos,
    insertarModulo,
    editarModulo,
    eliminarModulo
} from "../model/ModulosModel.js"

const obtenerMensajeError = (error) => (
    error.originalError?.info?.message ||
    error.precedingErrors?.[0]?.originalError?.info?.message ||
    error.message
)

const esNoEncontrado = (mensaje) => /no existe|no encontrado|not found/i.test(mensaje || "")

const validarEnteroPositivo = (valor, nombreCampo) => {
    const numero = Number(valor)

    if (!Number.isInteger(numero) || numero <= 0) {
        return { error: `El ${nombreCampo} no es valido` }
    }

    return { valor: numero }
}

const prepararModulo = (body) => {
    const idCurso = validarEnteroPositivo(body.id_curso, "id_curso")
    const ordenModulo = validarEnteroPositivo(body.orden_modulo, "orden_modulo")
    const modulo = {
        id_curso: idCurso.valor,
        titulo: body.titulo?.trim(),
        descripcion: body.descripcion?.trim(),
        contenido: body.contenido?.trim(),
        video_url: body.video_url?.trim(),
        orden_modulo: ordenModulo.valor,
        duracion_estimada: body.duracion_estimada?.trim(),
        estado: body.estado?.trim()
    }

    const errores = []

    if (idCurso.error) errores.push(idCurso.error)
    if (ordenModulo.error) errores.push(ordenModulo.error)

    Object.entries(modulo).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            errores.push(`Falta ${key}`)
        }
    })

    return { modulo, errores }
}

const getModulos = async (req, res) => {
    try {
        const modulos = await listarModulos()

        return res.status(200).json({
            success: true,
            message: "Modulos obtenidos correctamente",
            data: modulos
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los modulos",
            error: obtenerMensajeError(error)
        })
    }
}

const addModulo = async (req, res) => {
    try {
        const { modulo, errores } = prepararModulo(req.body)

        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: errores.join(", ")
            })
        }

        const data = await insertarModulo(modulo)

        return res.status(201).json({
            success: true,
            message: "Modulo creado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al crear el modulo",
            error: mensajeError
        })
    }
}

const updateModulo = async (req, res) => {
    try {
        const id = validarEnteroPositivo(req.params.id, "id_modulo")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const { modulo, errores } = prepararModulo(req.body)

        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: errores.join(", ")
            })
        }

        const data = await editarModulo(id.valor, modulo)

        return res.status(200).json({
            success: true,
            message: "Modulo actualizado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al actualizar el modulo",
            error: mensajeError
        })
    }
}

const deleteModulo = async (req, res) => {
    try {
        const id = validarEnteroPositivo(req.params.id, "id_modulo")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const data = await eliminarModulo(id.valor)

        return res.status(200).json({
            success: true,
            message: "Modulo eliminado o desactivado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al eliminar el modulo",
            error: mensajeError
        })
    }
}

export { getModulos, addModulo, updateModulo, deleteModulo }
