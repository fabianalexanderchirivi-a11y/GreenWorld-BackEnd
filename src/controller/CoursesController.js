import { listarCursos } from "../model/CoursesModel.js"

const getCourses = async (req, res) => {
    try {
        const courses = await listarCursos()

        res.status(200).json({
            success: true,
            data: courses
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los cursos",
            error: error.message
        })
    }
}

export { getCourses }
