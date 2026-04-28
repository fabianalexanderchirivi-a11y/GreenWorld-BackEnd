import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getConnection } from "./config/db.js"
import usersRouter from "./routes/UsersRouters.js"
import CoursesRouter from "./routes/CoursesRouter.js"
import CertificadoRouter from "./routes/CertificadoRouter.js"
import ModulosRouter from "./routes/ModulosRouter.js"
import InscripcionesRouter from "./routes/InscripcionesRouter.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(cors({
    origin: process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use("/api", usersRouter)
app.use("/api", CoursesRouter)
app.use("/api", CertificadoRouter)
app.use("/api", ModulosRouter)
app.use("/api", InscripcionesRouter)

app.listen(PORT, async () => {
    await getConnection()
    console.log(`Conectado a traves del puerto: ${PORT}`)
})
