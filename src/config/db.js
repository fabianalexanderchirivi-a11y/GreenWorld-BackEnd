import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

const stringConnection = {

    user : process.env.USER,
    password: process.env.PASSWORD,
    server : process.env.SERVER,
    database : process.env.DATABASE,
    options : {
        trustServerCertificate : true
    }

}
export async function getConnection(){
    try {
        let conn= await sql.connect(stringConnection)
        console.log("conectado a la base de datos")
        return conn



        
    } catch (error) {
    
        console.log('error al conectarse a la BD: ${error}')
        
    }
}
