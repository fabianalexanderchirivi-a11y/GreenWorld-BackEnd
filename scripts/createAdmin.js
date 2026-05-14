import bcrypt from "bcrypt";
import { poolPromise, sql } from "../src/config/db.js";

const ADMIN_EMAIL = "green@gmail.com";
const ADMIN_PASSWORD = "greenworld123";
const ADMIN_ROLE = "admin";
const ACTIVE_STATUS = "Activo";

async function createAdmin() {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const existingUser = await pool.request()
        .input("correo", sql.VarChar(150), ADMIN_EMAIL)
        .query(`
            SELECT TOP 1 id_usuario
            FROM dbo.usuarios
            WHERE correo = @correo
        `);

    if (existingUser.recordset.length > 0) {
        const id_usuario = existingUser.recordset[0].id_usuario;

        await pool.request()
            .input("id_usuario", sql.Int, id_usuario)
            .input("contrasena", sql.NVarChar(255), hashedPassword)
            .input("rol", sql.VarChar(20), ADMIN_ROLE)
            .input("estado", sql.NVarChar(20), ACTIVE_STATUS)
            .query(`
                UPDATE dbo.usuarios
                SET
                    contrasena = @contrasena,
                    rol = @rol,
                    estado = @estado
                WHERE id_usuario = @id_usuario
            `);

        console.log(`Cuenta administradora actualizada: ${ADMIN_EMAIL}`);
        return;
    }

    await pool.request()
        .input("nombre", sql.NVarChar(100), "Green")
        .input("apellido", sql.NVarChar(100), "Admin")
        .input("correo", sql.NVarChar(150), ADMIN_EMAIL)
        .input("contrasena", sql.NVarChar(255), hashedPassword)
        .input("estado", sql.NVarChar(20), ACTIVE_STATUS)
        .input("rol", sql.VarChar(20), ADMIN_ROLE)
        .query(`
            INSERT INTO dbo.usuarios
            (
                nombre,
                apellido,
                correo,
                contrasena,
                fecha_registro,
                estado,
                rol
            )
            VALUES
            (
                @nombre,
                @apellido,
                @correo,
                @contrasena,
                GETDATE(),
                @estado,
                @rol
            )
        `);

    console.log(`Cuenta administradora creada: ${ADMIN_EMAIL}`);
}

createAdmin()
    .catch((error) => {
        console.error("Error al crear la cuenta administradora:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        const pool = await poolPromise;
        await pool.close();
    });
