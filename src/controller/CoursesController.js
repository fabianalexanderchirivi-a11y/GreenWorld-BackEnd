import {
    listarCursos,
    listarCursosAdmin,
    insertarCurso,
    editarCurso,
    eliminarCurso
} from "../model/CoursesModel.js"

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

const prepararCurso = (body) => {
    const curso = {
        titulo: body.titulo?.trim(),
        descripcion: body.descripcion?.trim(),
        imagen: body.imagen?.trim(),
        duracion_estimada: body.duracion_estimada?.trim(),
        nivel: body.nivel?.trim(),
        categoria: body.categoria?.trim(),
        estado: body.estado?.trim() || "publicado"
    }

    const faltantes = Object.entries(curso)
        .filter(([key, value]) => !["imagen", "duracion_estimada"].includes(key) && !value)
        .map(([key]) => key)

    return { curso, faltantes }
}

const getCourses = async (req, res) => {
    try {
        const courses = await listarCursos()
        const cursosActivos = courses.filter((course) => {
            const estado = String(course.estado || "activo").trim().toLowerCase()
            return ["activo", "disponible", "publicado"].includes(estado)
        })

        return res.status(200).json({
            success: true,
            message: "Cursos obtenidos correctamente",
            data: cursosActivos
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los cursos",
            error: obtenerMensajeError(error)
        })
    }
}

const getCoursesAdmin = async (req, res) => {
    try {
        const courses = await listarCursosAdmin()

        return res.status(200).json({
            success: true,
            message: "Cursos obtenidos correctamente",
            data: courses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los cursos",
            error: obtenerMensajeError(error)
        })
    }
}

const addCourse = async (req, res) => {
    try {
        const { curso, faltantes } = prepararCurso(req.body)

        if (faltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos obligatorios: ${faltantes.join(", ")}`
            })
        }

        const data = await insertarCurso(curso)

        return res.status(201).json({
            success: true,
            message: "Curso creado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)

        return res.status(500).json({
            success: false,
            message: mensajeError || "Error al crear el curso",
            error: mensajeError
        })
    }
}

const updateCourse = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_curso")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const { curso, faltantes } = prepararCurso(req.body)

        if (faltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Faltan datos obligatorios: ${faltantes.join(", ")}`
            })
        }

        const data = await editarCurso(id.valor, curso)

        return res.status(200).json({
            success: true,
            message: "Curso actualizado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al actualizar el curso",
            error: mensajeError
        })
    }
}

const deleteCourse = async (req, res) => {
    try {
        const id = validarId(req.params.id, "id_curso")

        if (id.error) {
            return res.status(400).json({
                success: false,
                message: id.error
            })
        }

        const data = await eliminarCurso(id.valor)

        return res.status(200).json({
            success: true,
            message: "Curso eliminado o desactivado correctamente",
            data
        })
    } catch (error) {
        const mensajeError = obtenerMensajeError(error)
        const status = esNoEncontrado(mensajeError) ? 404 : 500

        return res.status(status).json({
            success: false,
            message: mensajeError || "Error al eliminar el curso",
            error: mensajeError
        })
    }
}

export { getCourses, getCoursesAdmin, addCourse, updateCourse, deleteCourse }
