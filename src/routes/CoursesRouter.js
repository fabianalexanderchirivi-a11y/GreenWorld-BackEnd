import express from "express"
import {
    getCourses,
    getCoursesAdmin,
    addCourse,
    updateCourse,
    deleteCourse
} from "../controller/CoursesController.js"
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/courses", getCourses)
router.get("/courses/admin", verificarToken, verificarAdmin, getCoursesAdmin)
router.post("/courses", verificarToken, verificarAdmin, addCourse)
router.put("/courses/:id", verificarToken, verificarAdmin, updateCourse)
router.delete("/courses/:id", verificarToken, verificarAdmin, deleteCourse)

export default router
