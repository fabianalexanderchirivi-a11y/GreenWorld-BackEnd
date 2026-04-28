import { listarModulos } from "../model/ModulosModel.js"

const getModulos = async (req, res) => {
    try {
        const modulos = await listarModulos()

        res.status(200).json({
            success: true,
            data: modulos
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los modulos",
            error: error.message
        })
    }
}

export { getModulos }
