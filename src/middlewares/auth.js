import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó el token.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido.' });
        }

        req.userId = decoded.userId; // Puedes guardar el id del usuario para usarlo más adelante
        req.nickName = decoded.nickName; // También puedes guardar el nickname
        next(); // Llama al siguiente middleware o ruta
    });
};
