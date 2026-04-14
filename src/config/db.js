import sql from 'mssql'
import dotenv from 'dotenv'

dotenv.config()

const stringConnection = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    options: {
        trustServerCertificate: true
    }
}

export async function getConnection() {
    try {
        const conn = await sql.connect(stringConnection)
        console.log('Conectado a la base de datos')
        return conn
    } catch (error) {
        console.error('Error al conectarse a la BD:', error)
        throw error
    }
}
