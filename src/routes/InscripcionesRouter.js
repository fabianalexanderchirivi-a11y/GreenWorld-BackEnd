import express from "express"
import {
    getInscripciones,
    addInscripcion,
    updateInscripcion,
    deleteInscripcion
} from "../controller/InscripcionesController.js"

const router = express.Router()

router.get("/inscripciones", getInscripciones)
router.post("/inscripciones", addInscripcion)
router.put("/inscripciones/:id", updateInscripcion)
router.delete("/inscripciones/:id", deleteInscripcion)

export default router
