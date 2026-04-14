import express from 'express'
import { getConnection } from './config/db.js'
import dotenv from 'dotenv'
dotenv.config()
const app= express();
const PORT =process.env.PORT
app.listen(PORT,()=>{
    getConnection()
    console.log('Conectado a traves del puerto: ${PORT}')
})
