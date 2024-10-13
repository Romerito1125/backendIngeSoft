import express from "express";
import "../src/db/conn.js";
import documentoRoutes from "../src/routers/documentoRouter.js"
import clienteRoutes from "../src/routers/clienteRouter.js"
import categoriaRoutes from "../src/routers/categoriaRouter.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/documentos",documentoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/categorias", categoriaRoutes);

app.listen(3000)
console.log('Server on port 3000')