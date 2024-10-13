import express from "express";
import { categoriaModel } from "../models/categoria.js";

export async function CrearCategoria(req, res){
    try {
        const subCategorias = req.body.subcategoria;
        
        const subCategoriasIds = subCategorias.map(x => x.categoriaId);

        const categoriasValidas = await validarSubCategoria(subCategoriasIds);
        if (!categoriasValidas) {
            return res.status(404).send('Una o más sub categorias ingresadas no existen en la base de datos');
        }

        const categoriaCrear = new categoriaModel(req.body)
        const insertarCategoria = await categoriaCrear.save();
        res.status(201).send(insertarCategoria);
    } catch (e) {
        res.status(400).send(e)
    }
}

const validarSubCategoria = async (subCategoriaId) => {
    const subCategoriasValidas = await categoriaModel.find({_id: {$in: subCategoriaId}});
    return subCategoriasValidas.length === subCategoriaId;
}


export async function eliminarCategoria(req, res){
    try {
        const categoriaId = req.params.categoriaId;
        const categoriaEliminar = await categoriaModel.findById(categoriaId);
        if (!categoriaEliminar) {
            return res.status(404).send('La categoria a eliminar no existe en la base de datos');
        }
        await categoriaModel.findByIdAndDelete(categoriaId);
        res.status(200).send('La categoria ha sido eliminada con éxito');
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function eliminarSubcategoriasDeCategoria(req, res) {
    try {
        const categoriaId = req.params.categoriaId;
        const subCategoriaId = req.params.subCategoriaId;

        const categoria = await categoriaModel.find({_id: categoriaId, "subcategoria.categoriaId": subCategoriaId});
        if (!categoria) {
            return res.status(404).send('Error encontrando la categoria con la subcategoria suministrada');
        }else{
            const categoriaActualizada = await categoriaModel.findByIdAndUpdate(
                categoriaId,
                { $pull: { subcategoria: { categoriaId: subCategoriaId } } }, // Elimina la subcategoría con el ID suministrado
                { new: true } // Para devolver el documento actualizado
            );
            res.status(200).send({ message: 'Subcategoría eliminada correctamente', categoriaActualizada });
        }
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function actualizarCategoria(req, res) {
    try {
        const categoriaId = req.params.categoriaId;

        const categoriaActualizar = await categoriaModel.findByIdAndUpdate(categoriaId, req.body,{new: true});
        if(!categoriaActualizar){
            return res.status(400).send('La categoria a editar no existe en la base de datos');
        }
        res.status(201).send('La categoria ha sido actualizada correctamente');
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function listarCategorias(req, res) {
    try {
        const categorias = await categoriaModel.find({});
        if (!categorias) {
            return res.status(404).send('No hay categorias para listar');
        }
        res.status(200).send(categorias);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function buscarCategoriaNombre(req, res) {
    try {
        const categoriaNombre = req.params.categoriaNombre;
        const categorias = await categoriaModel.find({nombre: { $regex: categoriaNombre, $options: 'i' }})
        if (!categorias) {
            return res.status(404).send('No hay categorias para listar con el nombre dado');
        }
        res.status(200).send(categorias);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}