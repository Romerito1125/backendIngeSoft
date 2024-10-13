import mongoose from "mongoose"
import "./documento.js"

const infoPreguntaSchema = new mongoose.Schema({
    preguntaAutenticacion: {type: String, required: true},
    respuesta: {type: String, required: true}
},  { _id: false })

const registroSchema = new mongoose.Schema({
    correo: {type: String, required: true},
    contrasenia: {type: String, required: true},
    fechaRegistro: {type: Date, default: Date.now, required: true},
    infoPregunta: {type: infoPreguntaSchema, required: true}
},  { _id: false })

const documentosDescargadosSchema = new mongoose.Schema({
    documentoId: {type: mongoose.Types.ObjectId, ref : "Documentos" ,required: true},
    titulo: {type: String, required: true},
    fecha: {type: Date, default: Date.now(), required: true}
},  { _id: false })

const DocumentosVistosSchema = new mongoose.Schema({
    documentoId: {type: mongoose.Types.ObjectId, ref : "Documentos" ,required: true},
    titulo: {type: String, required: true},
    fecha: {type: Date, default: Date.now(), required: true}
},  { _id: false })

const contraseniasSchema = new mongoose.Schema({
    contrasenia: {type: String, required: true},
    estado: {type: String, enum:["Activa", "Invactiva"], default: "Inactiva", required: true}
},  { _id: false })


const ClienteSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    apellidos: {type: String, required: true},
    nickName: {type: String, required: true},
    registro: {type: registroSchema, required: true},
    documentosDescargados: [{type: documentosDescargadosSchema, required: false}],
    documentosVistos : [{type: DocumentosVistosSchema, required: false}],
    numDocumentosPublicados: {type: Number, required: true},
    documentosPublicados: [{type: mongoose.Types.ObjectId, ref: "Documentos", required: false}],
    contrasenias:[contraseniasSchema]
})

export const clienteModel = mongoose.model("Clientes",ClienteSchema,"Clientes");