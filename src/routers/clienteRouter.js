import express from "express";
import * as controller from "../controllers/clienteController.js";

const router = express.Router();

// Autenticación nueva  JWT - Registrar e iniciar sesión


router.post('/registrar', controller.registrarCliente);
router.post('/login', controller.iniciarSesion);

// Fin nuevas autenticación.

router.post('/crearUsuario', controller.crearCliente);


router.get('/listarUsuarios', controller.listarUsuarios);
router.get('/buscarUsuario/:usuarioId', controller.buscarUsuario);
router.get('/buscarUsuariosNickName/:nickName', controller.buscarUsuariosNickName);

router.patch('/actualizarUsuario/:usuarioId', controller.editarUsuario);

router.delete('/eliminarUsuario/:usuarioId', controller.eliminarCliente);


export default router;