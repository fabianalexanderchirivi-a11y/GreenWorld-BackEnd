import express from "express"
import {
    getModulos,
    addModulo,
    updateModulo,
    deleteModulo
} from "../controller/ModulosController.js"

const router = express.Router()

router.get("/modulos", getModulos)
router.post("/modulos", addModulo)
router.put("/modulos/:id", updateModulo)
router.delete("/modulos/:id", deleteModulo)

export default router
