import express from "express";
import * as controller from "../controllers/documentoController.js"
import upload from '../middlewares/uploadFilesMiddleware.js'; 

const router = express.Router();


router.post('/crearDocumento', controller.crearDocumento);
router.post('/crearDocumentoArchivo', upload.single('archivo'), controller.crearDocumentoArchivo); 

router.get('/listarDocumentos', controller.listarDocumentos);
router.get('/listarDocumentosCategoria/:categoriaNombre', controller.listarDocumentosCategoria);
router.get('/listarDocumentosCategoriaId/:categoriaId', controller.listarDocumentosCategoriaId);
router.get('/listarDocumentosCategoriaSubcategoria/:categoriaNombre/:subCategoriaNombre', controller.buscarDocumentosPorCategoriaYSubcategoria);
router.get('/verAutores/:documentoId', controller.verAutores);
router.get('/verOtrosDocumentos/:autorId', controller.visualizarOtrosDocumentos);
router.get('/documentoVisor/:documentoId', controller.mostrarDocumentoConPDFKit);
router.get('/descargar/:registrado/:idArchivo', controller.descargarDocumento);

router.patch('/actualizarInfoDoc/:documentoId', controller.actualizarDocumento);

router.delete('/eliminarDoc/:documentoId', controller.eliminarDocumento);

export default router;