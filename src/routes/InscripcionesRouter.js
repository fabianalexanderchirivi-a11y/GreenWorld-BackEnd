import express from "express"
import { getInscripciones } from "../controller/InscripcionesController.js"

const router = express.Router()

router.get("/inscripciones", getInscripciones)

export default router
