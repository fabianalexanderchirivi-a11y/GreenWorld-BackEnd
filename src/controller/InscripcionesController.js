import { listarInscripciones } from "../model/InscripcionesModel.js"

const getInscripciones = async (req, res) => {
    try {
        const inscripciones = await listarInscripciones()

        res.status(200).json({
            success: true,
            data: inscripciones
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las inscripciones",
            error: error.message
        })
    }
}

export { getInscripciones }
