import express from "express";
import { documentoModel } from "../models/documento.js";
import { categoriaModel } from "../models/categoria.js";
import { clienteModel } from "../models/clientes.js"; 
import mongoose from "mongoose";
import { buildPDF } from "../libs/pdfkit.js";
import doc from "pdfkit";

//Manejo de propias excepciones
//Consultas mongo // En otras capas a parte.


//Crear documento
export async function crearDocumento(req, res){
    try {
        const categorias = req.body.categoria;
        const infoAutores = req.body.infoAutores;
        const valoraciones = req.body.valoraciones;

        // Se obtienes los ids que se deben validar
        const categoriasIds = categorias.categoriaId;
        const autoresIds = infoAutores.filter(a => a.autorId).map(a => a.autorId); // Solo aquellos que tengan autorId
        const clientesIds = valoraciones.map(v => v.clienteId);

        // Validar existencia de categorías
        const sonCategoriasValidas = await validarCategorias(categoriasIds);
        if (!sonCategoriasValidas) {
            return res.status(400).send("Una o más categorías no existen");
        }

        // Validar existencia de autores
        const sonAutoresValidos = await validarAutores(autoresIds);
        if (!sonAutoresValidos) {
            return res.status(400).send("Uno o más autores no existen");
        }

        // Validar existencia de clientes en valoraciones
        const sonClientesValidos = await validarClientesValoracion(clientesIds);
        if (!sonClientesValidos) {
            return res.status(400).send("Uno o más clientes de valoraciones no existen");
        }

        // Crear el documento si todas las validaciones pasaron
        const documento = new documentoModel(req.body);
        const documentoGuardar = await documento.save();
        res.status(201).send(documentoGuardar);
    } catch (e) {
        res.status(400).send(e)
    }
}

//Crear documento archivo
export async function crearDocumentoArchivo(req, res){
    try {
      const categorias = JSON.parse(req.body.categoria);
      const infoAutores = JSON.parse(req.body.infoAutores);
      const valoraciones = JSON.parse(req.body.valoraciones);
  
      const categoriasIds = categorias.map((cat) => cat.categoriaId);
      const autoresIds = infoAutores
        .filter((a) => a.autorId)
        .map((a) => a.autorId);
      const clientesIds = valoraciones.map((v) => v.clienteId);
  
      const sonCategoriasValidas = await validarCategorias(categoriasIds);
      if (!sonCategoriasValidas) {
        return res.status(400).send("Una o más categorías no existen");
      }
  
      const sonAutoresValidos = await validarAutores(autoresIds);
      if (!sonAutoresValidos) {
        return res.status(400).send("Uno o más autores no existen");
      }
  
      const sonClientesValidos = await validarClientesValoracion(clientesIds);
      if (!sonClientesValidos) {
        return res
          .status(400)
          .send("Uno o más clientes de valoraciones no existen");
      }
  
      if (!req.file) {
        return res.status(400).send("Error: No se ha subido ningún archivo");
      }
  
      const documento = new documentoModel({
        ...req.body,
        URL: `uploads/${req.file.filename}`,
        categoria: categorias,
        infoAutores: infoAutores,
        valoraciones: valoraciones,
      });
  
      const documentoGuardar = await documento.save();
      res.status(201).send(documentoGuardar);
    } catch (e) {
      res.status(500).send(e);
    }
}


const validarCategorias = async(categoriasIds) => {
    const categoriasValidas = await categoriaModel.find({_id: {$in: categoriasIds}});
    return categoriasValidas.length === categoriasIds.length;
}

const validarAutores = async (autoresIds) => {
    const autoresValidos = await clienteModel.find({_id: { $in: autoresIds }});
    return autoresValidos.length === autoresIds.length;
};

const validarClientesValoracion = async (clientesIds) => {
    const clientesValidos = await clienteModel.find({_id: { $in: clientesIds }});
    return clientesValidos.length === clientesIds.length;
};


//Listar documentos
export async function listarDocumentos(req, res){
    try {
        const documentosRecuperados = await documentoModel.find({"visibilidad": {$not: {$eq: "Privado"}}});
        if (documentosRecuperados.length == 0) {
            return res.status(404).send('No hay documentos visibles');
        }
        const documentos = documentosRecuperados.map(mapearDocumento).join("\n"); 
        res.status(200).send(documentos);
    } catch (e) {
        res.status(400).send(e)
    }
}

//Listar Documentos por categoría (nombre)
export async function listarDocumentosCategoria(req, res){
    try {
        const { categoriaNombre } = req.params;
        const categoriaPorNombre = await categoriaModel.findOne({ "nombre": { $eq: categoriaNombre } });
        if(!categoriaPorNombre){
            return res.status(404).send('No se ha encontrado la categoria buscada');
        }

        const catId = categoriaPorNombre._id;

        const documentosFiltrados = await documentoModel.find({"categoria.categoriaId": catId,"visibilidad": { $not: { $eq: "Privado" } }});
        if (documentosFiltrados.length == 0) {
            return res.status(404).send('No se han creado documentos con la categoria buscada')
        }
        const documentos = documentosFiltrados.map(mapearDocumento).join("\n");

        res.status(200).send(documentos);
    } catch (e) {
        res.status(400).send(e);
    }
}


//Listar Documentos por categoría (id)
export async function listarDocumentosCategoriaId(req,res){
    try {
        const categoriaId = req.params.categoriaId;
        const documentos = await documentoModel.find({"categoria.categoriaId" : {$eq: categoriaId}});
        if (documentos.length == 0) {
            return res.status(404).send('No se han creado documentos con la categoria buscada')
        }
        const documentosMapeados = documentos.map(mapearDocumento).join("\n");

         res.status(200).send(documentosMapeados);

    } catch (e) {
         res.status(400).send(e);
    }
}

//Listar Documentos por categoría y subcategoría (nombres)
export async function buscarDocumentosPorCategoriaYSubcategoria(req, res){
    try {
        const categoriaNombre = req.params.categoriaNombre;
        const subCategoriaNombre = req.params.subCategoriaNombre;

        const documentosEncontrados = await documentoModel.aggregate([
            {
                $match: {
                    visibilidad : "Publico",
                    'categoria.categoriaNombre': categoriaNombre,
                    'categoria.subCategoriaNombre': subCategoriaNombre,
                },
            }
        ]);
        if (documentosEncontrados.length == 0) {
            return res.status(404).send('No se han creado documentos con los filtros ingresados')
        }
        const documentos = documentosEncontrados.map(mapearDocumento).join("\n");

        res.status(200).send(documentos);
        
    } catch (e) {
        res.status(400).send(e);
    }
}


// Ver información de los autores de los documentos:
export async function verAutores(req, res){
    try {
        const documentoIdBuscar = req.params.documentoId;
        
        const documento = await documentoModel.findOne({_id: documentoIdBuscar})
        if (documento) {
            const informacionAutores = await documentoModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId.createFromHexString(documentoIdBuscar),
                        visibilidad : "Publico"
                    }
                },
                { $unwind: { path: '$infoAutores' } },
                {
                    $lookup: {
                        from: 'Clientes',
                        localField: 'infoAutores.autorId',
                        foreignField: '_id',
                        as: 'autor'
                    }
                },
                { $unwind: { path: '$autor', preserveNullAndEmptyArrays: true } }, // Mantiene autores que no tienen coincidencia
                {
                    $project: {
                        _id: 0,
                        Nombre: '$infoAutores.nombre',
                        NickName: { $ifNull: ['$autor.nickName', 'No disponible'] },
                        'Numero documentos Publicados': { $ifNull: ['$autor.numDocumentosPublicados', 0] },
                        'Documentos Publicados': { $ifNull: ['$autor.documentosPublicados', []] }
                    }
                }
            ]);

            const informacionAutoresMapeada = informacionAutores.map(info => {
                return `Nombre: ${info.Nombre}\n` +
                       `NickName: ${info.NickName}\n` +
                       `Número de Documentos Publicados: ${info['Numero documentos Publicados']}\n` +
                       `Documentos Publicados: ${info['Documentos Publicados'].join(', ') || 'Ninguno'}\n`;
            }).join("\n");

            res.status(200).send(informacionAutoresMapeada);

        } else {
            res.status(404).send('No se encontró el documento con el id ingresado');
        }
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function eliminarDocumento(req, res) {
    try {
        const idDocEliminar = req.params.documentoId;
        const docEliminar = await documentoModel.findById(idDocEliminar);
        if (!docEliminar) {
           return res.status(400).send("El documento que se desea eliminar no se encuentra en la base de datos");
        }
        await documentoModel.findByIdAndDelete(idDocEliminar);
        res.status(200).send(docEliminar);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

//Visualizar otros documentos del autor en específico
export async function visualizarOtrosDocumentos(req, res){
    try {
        const autorId = req.params.autorId;

        const documentosDeEseAutor = await documentoModel.aggregate(
            [
              { $unwind: { path: '$infoAutores' } },
              {
                $match: {
                  'infoAutores.autorId':  mongoose.Types.ObjectId.createFromHexString(autorId),
                  visibilidad: 'Publico',
                  'infoAutores.tipo': 'AutorPublica'
                }
              }
            ]
          );
          
        const documentos = documentosDeEseAutor.map(mapearDocumento).join("\n");

        res.status(200).send(documentos);

    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}


//Función para mostrar la metadata del documento (Una aproximación) 
export async function mostrarDocumentoConPDFKit(req, res){
    try {
        const documentoId = mongoose.Types.ObjectId.createFromHexString(req.params.documentoId);
        const documento = await documentoModel.findOne({ _id: documentoId });

        if (!documento) {
            return res.status(404).send('Documento no encontrado');
        }

        // Establecer el tipo de contenido como PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');

        // Crear el PDF (ajustando el orden de los parámetros)
        buildPDF(
            chunk => res.write(chunk), // dataCallback para escribir cada chunk
            () => res.end(),           // endCallback para finalizar la respuesta
            documento                  // Objeto documento para usar en el PDF
        );

    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

//Actualizar documento 
export async function actualizarDocumento(req, res){
    try {
        const idDocumento = req.params.documentoId;
        
        if (req.body.fechaPublicacion || req.body.fechaPublicacion || req.body.numDescargas || req.body.valoraciones) {
            return res.status(400).send('No se pueden modificar algunos de los campos que desea');
        }

        const documentoActualizado = await documentoModel.findByIdAndUpdate(idDocumento, req.body,{new: true});
        if(!documentoActualizado){
            return res.status(404).send('Documento no encontrado')
        }
        res.status(201).send('Documento actualizado correctamente')

    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

//Descargar archivo
export async function descargarDocumento(req, res){
    try {
      const registrado = req.params.registrado === 'true';

      if (registrado) {
        const idArchivo = req.params.idArchivo;
        const urlArchivo = await documentoModel.findOne(
          { _id: mongoose.Types.ObjectId.createFromHexString(idArchivo) },
          { _id: 0, URL: 1, visibilidad: 1 }
        );
  
        if (!urlArchivo) {
          return res.status(404).send("Archivo no encontrado.");
        }
        console.log(typeof(urlArchivo.visibilidad))
        if (urlArchivo.visibilidad === "Privado") {
            return res.status(403).send("Archivo no disponible para descarga.");
        }
        const rutaArchivo = String(urlArchivo.URL);
        res.download(rutaArchivo, (err) => {
          if (err) {
            res.status(404).send("Archivo no encontrado " + rutaArchivo);
          }
        });
      } else {
        res.status(401).send({ error: "Debe iniciar sesión para poder descargar el archivo." });
      }
    } catch (e) {
      res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}


/*FALTA: Manejar valoraciones y comentarios por aparte, tanto eliminarlos como crearlos,
autenticación de usuario y manejo de excepciones (pasar todas las consultas a service)
Triggers.
*/

// funcion para mapear la salida de los documentos en postman
function mapearDocumento(doc){
    return `    
        Documento:
        -----------------------
        Título: ${doc.titulo || "Sin título"}
        URL: ${doc.URL || "Sin URL"}
        Descripción: ${doc.descripcion || "Sin descripción"}

        Categoría(s):
        ${doc.categoria.length > 0 
            ? doc.categoria.map(cat => `
                - Nombre: ${cat.categoriaNombre || "Sin nombre"}
                - Subcategoría: ${cat.subCategoriaNombre || "Sin subcategoría"}
            `).join("\n")
            : "Sin categorías"}

        Visibilidad: ${doc.visibilidad}
        Fecha de Publicación: ${new Date(doc.fechaPublicacion).toLocaleString()}
        Número de Descargas: ${doc.numDescargas}
        Última Modificación: ${new Date(doc.fechaUltimaModificacion).toLocaleString()}
        
        Autores:
        ${doc.infoAutores.length > 0 
            ? doc.infoAutores.map(autor => `
                - Nombre: ${autor.nombre || "Sin nombre"}
                - Tipo: ${autor.tipo || "Sin tipo"}
                - Registrado: ${autor.registrado ? 'Sí' : 'No'}
            `).join("\n")
            : "Sin autores"}
        
        Valoraciones:
        ${doc.valoraciones.length > 0 
            ? doc.valoraciones.map(val => `
                - Cliente ID: ${val.clienteId || "Sin ID"}
                - Puntuación: ${val.puntuacion}
                - Comentario: ${val.comentario || "Sin comentario"}
                - Fecha: ${new Date(val.fecha).toLocaleString()}
            `).join("\n")
            : "No hay valoraciones disponibles"}
        
        Imagen de Portada: ${doc.imagenPortada || "Sin imagen"}
        
        -----------------------
    `;
}


