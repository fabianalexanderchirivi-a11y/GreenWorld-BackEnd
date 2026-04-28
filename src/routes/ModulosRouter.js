import express from "express"
import { getModulos } from "../controller/ModulosController.js"

const router = express.Router()

router.get("/modulos", getModulos)

export default router
