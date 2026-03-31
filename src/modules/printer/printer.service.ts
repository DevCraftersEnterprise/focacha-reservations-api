import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface ReservationPdfData {
  customerName: string;
  guestCount: number;
  zoneName: string;
  formattedDate: string;
  formattedTime: string;
}

@Injectable()
export class PrinterService {
  createReservationPdf(data: ReservationPdfData): PDFKit.PDFDocument {
    // Crear documento PDF con tamaño de 80mm de ancho
    const doc = new PDFDocument({
      size: [226.77, 400], // 80mm de ancho, altura automática
      margins: { top: 10, bottom: 10, left: 10, right: 10 },
    });

    const pageWidth = 226.77;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const padding = 5;

    // Posición inicial del contenido
    let y = margin + padding;

    // Dibujar el rectángulo negro alrededor de todo
    doc.rect(margin, margin, contentWidth, 0).lineWidth(1);

    // Nombre del cliente centrado
    doc.fontSize(14).text(data.customerName, margin + padding, y, {
      width: contentWidth - padding * 2,
      align: 'center',
    });

    y += 30; // Espacio después del nombre

    // Columna izquierda: invitados y zona
    const leftX = margin + padding + 5;
    doc.fontSize(8).text(`${data.guestCount} personas`, leftX, y, {
      width: contentWidth / 2 - padding * 2,
      align: 'left',
    });

    y += 12;
    doc.fontSize(8).text(data.zoneName, leftX, y, {
      width: contentWidth / 2 - padding * 2,
      align: 'left',
    });

    // Columna derecha: fecha y hora
    const rightX = margin + contentWidth / 2;
    y -= 12; // Volver a la altura de "personas"

    doc.fontSize(8).text(data.formattedDate, rightX, y, {
      width: contentWidth / 2 - padding - 5,
      align: 'right',
    });

    y += 12;
    doc.fontSize(8).text(data.formattedTime, rightX, y, {
      width: contentWidth / 2 - padding - 5,
      align: 'right',
    });

    y += 15; // Espacio final

    // Calcular la altura total del contenido
    const totalHeight = y - margin + padding;

    // Dibujar el rectángulo completamente
    doc.rect(margin, margin, contentWidth, totalHeight).stroke();

    return doc;
  }

  getStream(doc: PDFKit.PDFDocument): Readable {
    return doc as unknown as Readable;
  }
}
