import express from "express";
import { clienteModel } from "../models/clientes.js"; 
import { documentoModel } from "../models/documento.js";
import mongoose from "mongoose";


export async function crearCliente(req, res){
    try {
        const documentosDescargados = req.body.documentosDescargados;
        const documentosVistos = req.body.documentosVistos;
        const documentosPublicados = req.body.documentosPublicados

        //Obtener los ids
        const documentosDescIds = documentosDescargados.map(x => x.documentoId);
        const documentosVisIds = documentosVistos.map(j => j.documentoId);
        const documentosPubIds = documentosPublicados.map(p => p.documentoId);

        const sonDocumentosDescValidos = await validarDocumentosDescargados(documentosDescIds);
        if (!sonDocumentosDescValidos) {
            return res.status(404).send('Uno o más documentos descargados ingresados no existen en la base de datos');
        }

        const sonDocumentosVisValidos = await validarDocumentosVistos(documentosVisIds);
        if (!sonDocumentosVisValidos) {
            return res.status(404).send('Uno o más documentos vistos ingresados no existen en la base de datos');
        }

        const sonDocumentosPubValidos = await validarDocumentosPublicados(documentosPublicados);
        if (!sonDocumentosPubValidos) {
            return res.status(404).send('Uno o más documentos publicados ingresados no existen en la base de datos');
        }

        const cliente = new documentoModel(req.body);
        const clienteGuardar = await cliente.save();
        res.status(201).send(clienteGuardar);
    } catch (e) {
        res.status(500).send(e);
    }
}

const validarDocumentosDescargados = async (documentosDescIds) => {
    const documentosValidos = await documentoModel.find({_id: {$in: documentosDescIds}});
    return documentosValidos.length === documentosDescIds;
}

const validarDocumentosVistos = async (documentosVisIds) => {
        const documentosValidos = await documentoModel.find({_id: {$in: documentosVisIds}});
    return documentosValidos.length === documentosVisIds;
}

const validarDocumentosPublicados = async (documentosPubIds) => {
    const documentosValidos = await documentoModel.find({_id: {$in: documentosPubIds}});
    return documentosValidos.length === documentosPubIds;
}


export async function eliminarCliente(req, res){
    try {
        const idUsuario = req.params.usuarioId;
        const usuarioAEliminar = await clienteModel.findById(idUsuario);
        if(!usuarioAEliminar){
            return res.status(400).send('El usuario a eliminar no existe en la base de datos');
        }
        await clienteModel.findByIdAndDelete(idUsuario);
        res.status(200).send('El usuario ha sido eliminado correctamente');
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}


export async function editarUsuario(req, res){
    try {
        const idUsuario = req.params.usuarioId;
        const usuarioAEditar = await clienteModel.findByIdAndUpdate(idUsuario, req.body,{new: true});
        if(!usuarioAEditar){
            return res.status(400).send('El usuario a editar no existe en la base de datos');
        }else{
            if (req.body.fechaRegistro || req.body.contrasenias) {
                return res.status(500).send('Alguno de los campos que se desean editar no están permitidos para esta funcionalidad');
            }
            res.status(201).send('Usuario actualizado correctamente');
        }
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}


export async function listarUsuarios(req, res){ 
    try {
        const usuarios = await documentoModel.find({});
        if (!usuarios) {
            return res.status(400).send('No hay usuarios para listar');
        }
        res.status(200).send(usuarios);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function buscarUsuario(req, res) {
    try {
        const idUsuarioBuscar = req.params.usuarioId
        const usuario = await documentoModel.findById(idUsuarioBuscar);
        if (!usuario) {
            return res.status(400).send('El usuario buscado no existe');
        }
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function buscarUsuariosNickName(req, res){
    try {
        const nickName = req.params.nickName;

        const usuarios =  await clienteModel.find({nickName: { $regex: nickName, $options: 'i' }});
        if (!usuarios) {
            return res.status(404).send({ message: 'No se encontraron usuarios con ese nick name' });
        }
        res.status(200).json(usuarios);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}