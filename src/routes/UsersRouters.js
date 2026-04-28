import express from "express"
import { getUsers, loginUser } from "../controller/UsersController.js"

const router = express.Router()

router.get("/users", getUsers)
router.post("/auth/login", loginUser)

export default router
