import express from "express";
import * as controller from "../controllers/clienteController.js";

const router = express.Router();


router.post('/crearUsuario', controller.crearCliente);


router.get('/listarUsuarios', controller.listarUsuarios);
router.get('/buscarUsuario/:usuarioId', controller.buscarUsuario);
router.get('/buscarUsuariosNickName/:nickName', controller.buscarUsuariosNickName);

router.patch('/actualizarUsuario/:usuarioId', controller.editarUsuario);

router.delete('/eliminarUsuario/:usuarioId', controller.eliminarCliente);


export default router;