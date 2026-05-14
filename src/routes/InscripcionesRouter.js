import express from "express"
import {
    getInscripciones,
    addInscripcion,
    updateInscripcion,
    deleteInscripcion,
    getMyCourses,
    startCourse,
    updateCourseProgress,
    cancelCourse
} from "../controller/InscripcionesController.js"
import { verificarToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/inscripciones", getInscripciones)
router.post("/inscripciones", addInscripcion)
router.put("/inscripciones/:id", updateInscripcion)
router.delete("/inscripciones/:id", deleteInscripcion)
router.get("/usuarios/me/cursos", verificarToken, getMyCourses)
router.post("/cursos/:id/iniciar", verificarToken, startCourse)
router.put("/cursos/:id/progreso", verificarToken, updateCourseProgress)
router.put("/cursos/:id/cancelar", verificarToken, cancelCourse)

export default router
