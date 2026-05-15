import express from "express"
import { getUsers, loginUser, addUser, updateUser, updateMe, deleteUser, deleteMe } from "../controller/UsersController.js"
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/users", verificarToken, verificarAdmin, getUsers)
router.post("/auth/login", loginUser)
router.post("/auth/register", addUser)
router.post("/usuarios", addUser)
router.put("/usuarios/me", verificarToken, updateMe)
router.delete("/usuarios/me", verificarToken, deleteMe)
router.put("/usuarios/:id", verificarToken, verificarAdmin, updateUser)
router.delete("/usuarios/:id", verificarToken, verificarAdmin, deleteUser)


export default router
