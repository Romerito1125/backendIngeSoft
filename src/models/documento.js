import mongoose from "mongoose"
import "./clientes.js"
import "./categoria.js"

const infoAutoresSchema = new mongoose.Schema({
    autorId: {type: mongoose.Types.ObjectId, ref: "Clientes" ,required: false},
    nombre: {type: String, required: true},
    tipo: {type: String, required: true},
    registrado: {type: Boolean, required: true}  
}, { _id: false });

const valoracionesSchema = new mongoose.Schema({
    clienteId: {type: mongoose.Types.ObjectId, ref: "Clientes" ,required: true},
    puntuacion: {type: Number, enum:[1,2,3,4,5], required: true},
    comentario: {type: String, required: false}, 
    fecha: {type: Date, default: Date.now, required: true}
},  { _id: false });

const categoriaSchema = new mongoose.Schema({
    categoriaId: {type: mongoose.Types.ObjectId, ref: "Categoria" ,required: true},
    categoriaNombre: {type: String, required: false},
    subCategoriaNombre: {type: String, required: false}
}, { _id: false })

const documentoSchema = new mongoose.Schema({
    titulo: {type: String, required: true},
    URL: {type: String, required: true},
    descripcion : {type: String, required: true},
    categoria : [categoriaSchema],  
    visibilidad: {type: String, enum: ["Publico", "Privado"], default: "Publico"},
    fechaPublicacion: {type: Date, default: Date.now, required: true},  
    infoAutores: [infoAutoresSchema],  
    numDescargas: {type: Number, default: 0},
    fechaUltimaModificacion: {type: Date, default: Date.now},
    valoraciones: [{type: valoracionesSchema, required: false}],
    imagenPortada: {type: String, required: false}
});

export const documentoModel = mongoose.model("Documentos", documentoSchema, "Documentos");