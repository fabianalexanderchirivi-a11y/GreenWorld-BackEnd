import sql from "mssql"
import dotenv from "dotenv"

dotenv.config()

const stringConnection = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

const poolPromise = sql.connect(stringConnection)

async function getConnection() {
    try {
        const conn = await poolPromise
        console.log("Conectado a la base de datos")
        return conn
    } catch (error) {
        console.error("Error al conectarse a la BD:", error)
        throw error
    }
}

export { sql, poolPromise, getConnection }
