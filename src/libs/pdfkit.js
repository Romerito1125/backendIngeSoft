import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function buildPDF(dataCallback, endCallback, documento) {
    // Asegúrate de que los callbacks son funciones
    if (typeof dataCallback !== 'function' || typeof endCallback !== 'function') {
        throw new TypeError("Los argumentos dataCallback y endCallback deben ser funciones.");
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // Estilos básicos
    const margin = 50;
    const contentWidth = doc.page.width - 2 * margin;
    const columnWidth = contentWidth / 3;

    // Columna izquierda - Título, Autores, Categorías, Fecha de Publicación y Última Modificación
    doc
        .fontSize(18)
        .text(documento.titulo, margin, margin, { width: columnWidth, align: 'left' })
        .moveDown()
        .fontSize(12)
        .text('Fecha de Publicación:', { align: 'left' })
        .text(new Date(documento.fechaPublicacion).toLocaleDateString(), { width: columnWidth, align: 'left' })
        .moveDown()
        .text('Fecha Última Modificación:', { align: 'left' })
        .text(new Date(documento.fechaUltimaModificacion).toLocaleDateString(), { width: columnWidth, align: 'left' })
        .moveDown()
        .text('Autores:', { align: 'left' })
        .list(documento.infoAutores.map(autor => `${autor.nombre}`), { width: columnWidth, align: 'left' }) 
        .moveDown()
        .text('Categorías:', { align: 'left' })
        .list(documento.categoria.map(cat => cat.categoriaNombre), { width: columnWidth, align: 'left' });

    // Imagen en el centro
    const imageWidth = columnWidth;
    const imageX = margin + columnWidth;
    const imageY = margin;

    if (documento.imagenPath) {
        const imagePath = path.resolve(documento.imagenPath);
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, imageX, imageY + 40, { width: imageWidth });
        } else {
            doc
                .fontSize(12)
                .text('Imagen no disponible', imageX, imageY + 40, { width: imageWidth, align: 'center' });
        }
    } else {
        doc
            .fontSize(12)
            .text('Imagen no disponible', imageX, imageY + 40, { width: imageWidth, align: 'center' });
    }

    // Botón de descarga simulado (usando un rectángulo con texto)
    doc
        .rect(imageX, imageY, imageWidth, 30)
        .fillAndStroke('#3498db', '#2980b9')
        .fillColor('white')
        .fontSize(14)
        .text('Descargar Documento', imageX, imageY + 7, { width: imageWidth, align: 'center' })
        .fillColor('black'); // Restablecer color

    // Columna derecha - Valoraciones (ajustado para estar más a la derecha)
    const valoracionesX = margin + 2 * columnWidth + 50; // Mover las valoraciones más a la derecha
    let valoracionY = margin;

    doc
        .fontSize(14)
        .text('Valoraciones:', valoracionesX, valoracionY, { width: columnWidth, align: 'left' });

    valoracionY += 20;

    if (documento.valoraciones.length > 0) {
        documento.valoraciones.forEach((val) => {
            doc
                .fontSize(12)
                .text(`Cliente ID: ${val.clienteId}`, valoracionesX, valoracionY, { width: columnWidth, align: 'left' })
                .moveDown(0.5)
                .text(`Puntuación: ${val.puntuacion}`, { width: columnWidth, align: 'left' })
                .moveDown(0.5)
                .text(`Comentario: ${val.comentario || "Sin comentario"}`, { width: columnWidth, align: 'left' })
                .moveDown(0.5)
                .text(`Fecha: ${new Date(val.fecha).toLocaleString()}`, { width: columnWidth, align: 'left' })
                .moveDown(1);

            valoracionY = doc.y;
        });
    } else {
        doc
            .fontSize(12)
            .text('No hay valoraciones disponibles', valoracionesX, valoracionY, { width: columnWidth, align: 'left' });
    }

    // Finalizar el documento
    doc.end();
}
