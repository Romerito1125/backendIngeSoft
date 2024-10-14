import express from 'express';
import * as controller from "../controllers/clienteController.js";
import { verificarToken } from '../middlewares/auth.js'; // Importar el middleware

const router = express.Router();

router.post('/registrar', controller.registrarCliente);
router.post('/login', controller.iniciarSesion);

// Rutas protegidas con el middleware de verificación de token
router.get('/protegida', verificarToken, (req, res) => {
    res.json({ message: 'Ruta protegida. Usuario autenticado.', userId: req.userId });
});

export default router;
