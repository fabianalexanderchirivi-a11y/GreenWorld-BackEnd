import express from "express"
import { getUsers, loginUser, addUser, updateUser, deleteUser } from "../controller/UsersController.js"

const router = express.Router()

router.get("/users", getUsers)
router.post("/auth/login", loginUser)
router.post("/auth/register", addUser)
router.post("/usuarios", addUser)
router.put("/usuarios/:id", updateUser)
router.delete("/usuarios/:id", deleteUser)


export default router
