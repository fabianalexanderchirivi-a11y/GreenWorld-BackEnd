import express from "express"
import {
    getRetos,
    getRetosAdmin,
    addReto,
    updateReto,
    deleteReto,
    getMyRetos,
    startReto,
    finishReto,
    cancelReto
} from "../controller/RetosController.js"
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/retos", getRetos)
router.get("/retos/admin", verificarToken, verificarAdmin, getRetosAdmin)
router.post("/retos", verificarToken, verificarAdmin, addReto)
router.put("/retos/:id", verificarToken, verificarAdmin, updateReto)
router.delete("/retos/:id", verificarToken, verificarAdmin, deleteReto)
router.get("/usuarios/me/retos", verificarToken, getMyRetos)
router.post("/retos/:id/iniciar", verificarToken, startReto)
router.put("/retos/:id/terminar", verificarToken, finishReto)
router.put("/retos/:id/cancelar", verificarToken, cancelReto)

export default router
