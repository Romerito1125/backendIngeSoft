import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Cliente from '../models/clientes.js'; // Importa tu modelo Cliente
import documentoModel from '../models/documentos.js'; // Asegúrate de importar el modelo de documentos

const SALT_ROUNDS = 10; // Número de rondas para el hash

// Funciones de validación
const validarDocumentosDescargados = async (documentosDescIds) => {
    const documentosValidos = await documentoModel.find({ _id: { $in: documentosDescIds } });
    return documentosValidos.length === documentosDescIds.length; // Comparar longitudes
};

const validarDocumentosVistos = async (documentosVisIds) => {
    const documentosValidos = await documentoModel.find({ _id: { $in: documentosVisIds } });
    return documentosValidos.length === documentosVisIds.length; // Comparar longitudes
};

const validarDocumentosPublicados = async (documentosPubIds) => {
    const documentosValidos = await documentoModel.find({ _id: { $in: documentosPubIds } });
    return documentosValidos.length === documentosPubIds.length; // Comparar longitudes
};

// Crear nuevo cliente, contraseña con hash (encriptada)
export const crearCliente = async (reqBody) => {
    try {
        const documentosDescargados = reqBody.documentosDescargados;
        const documentosVistos = reqBody.documentosVistos;
        const documentosPublicados = reqBody.documentosPublicados;

        const documentosDescIds = documentosDescargados.map(x => x.documentoId);
        const documentosVisIds = documentosVistos.map(j => j.documentoId);
        const documentosPubIds = documentosPublicados.map(p => p.documentoId);

        const sonDocumentosDescValidos = await validarDocumentosDescargados(documentosDescIds);
        if (!sonDocumentosDescValidos) {
            throw new Error('Uno o más documentos descargados ingresados no existen en la base de datos');
        }

        const sonDocumentosVisValidos = await validarDocumentosVistos(documentosVisIds);
        if (!sonDocumentosVisValidos) {
            throw new Error('Uno o más documentos vistos ingresados no existen en la base de datos');
        }

        const sonDocumentosPubValidos = await validarDocumentosPublicados(documentosPubIds);
        if (!sonDocumentosPubValidos) {
            throw new Error('Uno o más documentos publicados ingresados no existen en la base de datos');
        }

        const contraseniaHasheada = await bcrypt.hash(reqBody.registro.contrasenia, SALT_ROUNDS);
        reqBody.registro.contrasenia = contraseniaHasheada;

        const cliente = new Cliente(reqBody);
        const clienteGuardar = await cliente.save();
        return clienteGuardar;
    } catch (e) {
        throw new Error(e.message);
    }
};

// Iniciar sesión
export const login = async (correo, password) => {
    const cliente = await Cliente.findOne({ 'registro.correo': correo });
    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    const contraseniaValida = await bcrypt.compare(password, cliente.registro.contrasenia);
    if (!contraseniaValida) {
        throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
        { userId: cliente._id, nickName: cliente.nickName },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { token, cliente };
};
