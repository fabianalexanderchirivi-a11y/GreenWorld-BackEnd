import express from "express"
import {
    getCertificado,
    addCertificado,
    updateCertificado,
    deleteCertificado
} from "../controller/CertificadoController.js"

const router = express.Router()

router.get("/certificado", getCertificado)
router.get("/certificados", getCertificado)
router.post("/certificado", addCertificado)
router.post("/certificados", addCertificado)
router.put("/certificado/:id", updateCertificado)
router.put("/certificados/:id", updateCertificado)
router.delete("/certificado/:id", deleteCertificado)
router.delete("/certificados/:id", deleteCertificado)

export default router
