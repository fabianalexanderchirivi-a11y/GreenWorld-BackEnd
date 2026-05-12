import express from "express"
import {
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse
} from "../controller/CoursesController.js"

const router = express.Router()

router.get("/courses", getCourses)
router.post("/courses", addCourse)
router.put("/courses/:id", updateCourse)
router.delete("/courses/:id", deleteCourse)

export default router
