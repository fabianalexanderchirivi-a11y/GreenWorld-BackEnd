import { listarCertificado } from "../model/CertificadoModel.js"

const getCertificado = async (req, res) => {
    try {
        const certificado = await listarCertificado()

        res.status(200).json({
            success: true,
            data: certificado
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los certificados",
            error: error.message
        })
    }
}

export { getCertificado }
