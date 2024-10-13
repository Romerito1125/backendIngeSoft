import express from "express";
import * as controller from "../controllers/categoriaController.js";

const router = express.Router();

router.post('/crearCategoria', controller.CrearCategoria);

router.get('/listarCategorias', controller.listarCategorias);
router.get('/buscarCategoriaNombre/:categoriaNombre', controller.buscarCategoriaNombre);

router.patch('/actualizarCategoria/:categoriaId', controller.actualizarCategoria);

router.delete('eliminarCategoria/:categoriaId', controller.eliminarCategoria);
router.delete('eliminarSubcategoriasDeCategoria/:categoriaId/:subCategoriaId', controller.eliminarSubcategoriasDeCategoria);


export default router;
