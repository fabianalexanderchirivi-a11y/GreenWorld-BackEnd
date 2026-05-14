import jwt from "jsonwebtoken"

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization || ""
    const [tipo, token] = authHeader.split(" ")

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Token no proporcionado"
        })
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET)
        return next()
    } catch {
        return res.status(401).json({
            success: false,
            message: "Token invalido o expirado"
        })
    }
}

const verificarAdmin = (req, res, next) => {
    if (req.usuario?.rol !== "admin") {
        return res.status(403).json({
            success: false,
            message: "No tienes permisos de administrador"
        })
    }

    return next()
}

export { verificarToken, verificarAdmin }
