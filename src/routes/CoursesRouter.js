import express from "express"
import { getCourses } from "../controller/CoursesController.js"

const router = express.Router()

router.get("/courses", getCourses)

export default router
