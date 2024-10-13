import mongoose from "mongoose"

const categoriaSchema = new mongoose.Schema({
    nombre: {type: String, required: true},
    subcategoria: [{
        categoriaId: {type: mongoose.Types.ObjectId, ref: "Categoria"},
        nombre: {type: String, required: true}
    }],
});

export const categoriaModel = mongoose.model("Categoria", categoriaSchema, "Categoria");