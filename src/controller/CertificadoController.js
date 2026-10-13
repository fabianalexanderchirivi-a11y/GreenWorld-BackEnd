import {
    listarCertificado,
    insertarCertificado,
    editarCertificado,
    eliminarCertificado,
    crearCertificadoDeCurso,
    buscarCertificadoParaDescarga,
    exigirCursoCompletado
} from "../model/CertificadoModel.js"
import { generarPdfCertificado } from "../services/certificatePdf.js"

const obtenerMensajeError = (error) => (
    error.originalError?.info?.message ||
    error.precedingErrors?.[0]?.originalError?.info?.message ||
    error.message
)

const esNoEncontrado = (mensaje) => /no existe|no encontrado|not found/i.test(mensaje || "")
const estadoError = (error) => error.status || ([2601, 2627].includes(error.number) ? 409 : 500)

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

        return res.status(estadoError(error)).json({
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
        const status = error.status || (esNoEncontrado(mensajeError) ? 404 : estadoError(error))

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

const issueCourseCertificate = async (req, res) => {
    const id = validarEnteroPositivo(req.params.id, "id_curso")
    if (id.error) {
        return res.status(400).json({ success: false, message: id.error })
    }

    try {
        const { created, certificate } = await crearCertificadoDeCurso(req.usuario.id_usuario, id.valor)
        return res.status(created ? 201 : 200).json({
            success: true,
            message: created ? "Certificado generado correctamente" : "Certificado existente",
            data: {
                id_certificado: certificate.id_certificado,
                id_inscripcion: certificate.id_inscripcion,
                codigo_certificado: certificate.codigo_certificado,
                fecha_emision: certificate.fecha_emision,
                url_certificado: `/api/certificados/${certificate.id_certificado}/descargar`
            }
        })
    } catch (error) {
        const status = estadoError(error)
        return res.status(status).json({
            success: false,
            message: status === 500 ? "No se pudo generar el certificado" : error.message
        })
    }
}

const downloadCourseCertificate = async (req, res) => {
    const id = validarEnteroPositivo(req.params.id, "id_certificado")
    if (id.error) {
        return res.status(400).json({ success: false, message: id.error })
    }

    try {
        const certificate = await buscarCertificadoParaDescarga(id.valor)
        if (!certificate || Number(certificate.id_usuario) !== Number(req.usuario.id_usuario)) {
            return res.status(404).json({ success: false, message: "Certificado no encontrado" })
        }
        if (String(certificate.estado_usuario).toLowerCase() !== "activo") {
            return res.status(403).json({ success: false, message: "La cuenta no esta activa" })
        }
        exigirCursoCompletado(certificate)

        const pdf = await generarPdfCertificado(certificate)
        return res.status(200)
            .set("Content-Type", "application/pdf")
            .set("Content-Disposition", `attachment; filename="greenworld-certificado-${id.valor}.pdf"`)
            .set("Cache-Control", "private, no-store")
            .send(pdf)
    } catch (error) {
        const status = estadoError(error)
        return res.status(status).json({
            success: false,
            message: status === 500 ? "No se pudo descargar el certificado" : error.message
        })
    }
}

export {
    getCertificado,
    addCertificado,
    updateCertificado,
    deleteCertificado,
    issueCourseCertificate,
    downloadCourseCertificate
}
