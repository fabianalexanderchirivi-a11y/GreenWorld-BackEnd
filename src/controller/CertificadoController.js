import {
    listarCertificado,
    insertarCertificado,
    editarCertificado,
    eliminarCertificado
} from "../model/CertificadoModel.js"

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

const prepararCertificado = (body) => {
    const idInscripcion = validarEnteroPositivo(body.id_inscripcion, "id_inscripcion")
    const certificado = {
        id_inscripcion: idInscripcion.valor,
        codigo_certificado: body.codigo_certificado?.trim(),
        url_certificado: body.url_certificado?.trim()
    }
    const errores = []

    if (idInscripcion.error) errores.push(idInscripcion.error)
    if (!certificado.codigo_certificado) errores.push("Falta codigo_certificado")
    if (!certificado.url_certificado) errores.push("Falta url_certificado")

    return { certificado, errores }
}

const getCertificado = async (req, res) => {
    try {
        const certificado = await listarCertificado()

        return res.status(200).json({
            success: true,
            message: "Certificados obtenidos correctamente",
            data: certificado
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los certificados",
            error: obtenerMensajeError(error)
        })
    }
}

const addCertificado = async (req, res) => {
    try {
        const { certificado, errores } = prepararCertificado(req.body)

        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: errores.join(", ")
            })
        }

        const data = await insertarCertificado(certificado)

        return res.status(201).json({
            success: true,
            message: "Certificado creado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al crear el certificado",
            error: mensajeError
        })
    }
}

const updateCertificado = async (req, res) => {
    try {
        const id = validarEnteroPositivo(req.params.id, "id_certificado")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const { certificado, errores } = prepararCertificado(req.body)

        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: errores.join(", ")
            })
        }

        const data = await editarCertificado(id.valor, certificado)

        return res.status(200).json({
            success: true,
            message: "Certificado actualizado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al actualizar el certificado",
            error: mensajeError
        })
    }
}

const deleteCertificado = async (req, res) => {
    try {
        const id = validarEnteroPositivo(req.params.id, "id_certificado")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const data = await eliminarCertificado(id.valor)

        return res.status(200).json({
            success: true,
            message: "Certificado eliminado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al eliminar el certificado",
            error: mensajeError
        })
    }
}

export { getCertificado, addCertificado, updateCertificado, deleteCertificado }
