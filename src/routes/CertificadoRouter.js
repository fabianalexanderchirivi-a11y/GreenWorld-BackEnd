import express from "express"
import {
    getCertificado,
    addCertificado,
    updateCertificado,
    deleteCertificado,
    issueCourseCertificate,
    downloadCourseCertificate
} from "../controller/CertificadoController.js"
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/cursos/:id/certificado", verificarToken, issueCourseCertificate)
router.get("/certificados/:id/descargar", verificarToken, downloadCourseCertificate)

router.get("/certificado", verificarToken, verificarAdmin, getCertificado)
router.get("/certificados", verificarToken, verificarAdmin, getCertificado)
router.post("/certificado", verificarToken, verificarAdmin, addCertificado)
router.post("/certificados", verificarToken, verificarAdmin, addCertificado)
router.put("/certificado/:id", verificarToken, verificarAdmin, updateCertificado)
router.put("/certificados/:id", verificarToken, verificarAdmin, updateCertificado)
router.delete("/certificado/:id", verificarToken, verificarAdmin, deleteCertificado)
router.delete("/certificados/:id", verificarToken, verificarAdmin, deleteCertificado)

export default router
