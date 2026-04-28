import express from "express"
import { getCertificado } from "../controller/CertificadoController.js"

const router = express.Router()

router.get("/certificado", getCertificado)

export default router
