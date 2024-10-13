import mongoose from "mongoose"

const direccionSchema = new mongoose.Schema({
    ciudad: {type: String, required: true},
    departamento: { type: String, required: true },
    calle: { type: String, required: true }
})


const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    direccion: direccionSchema,
    edad: {
        type: Number,
        required: true
    }

})

// Estamos creando una nueva colección
export const UserModel = new mongoose.model("User", userSchema, "User");