import { Reservation } from '../entities/reservation.entity';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export const getReservationDocument = (
    reservation: Reservation,
): TDocumentDefinitions => {
    // Formatear la fecha
    const reservationDate = new Date(reservation.reservationDate);
    const formatter = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    });
    const formattedDate = formatter.format(reservationDate);

    // Formatear la hora (de formato 24h a 12h con am/pm)
    const [hours, minutes] = reservation.reservationTime.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const formattedTime = `${hour12}:${minutes}${period}`;

    return {
        pageSize: {
            width: 226.77, // 80mm en puntos
            height: 'auto',
        },
        pageMargins: [10, 10, 10, 10],
        content: [
            {
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                stack: [
                                    // Nombre del cliente centrado
                                    {
                                        text: reservation.customerName,
                                        alignment: 'center',
                                        fontSize: 14,
                                        bold: false,
                                        margin: [0, 5, 0, 10],
                                    },
                                    // Fila con información de invitados/zona y fecha/hora
                                    {
                                        columns: [
                                            // Columna izquierda: invitados y zona
                                            {
                                                width: '50%',
                                                stack: [
                                                    {
                                                        text: `${reservation.guestCount} personas`,
                                                        fontSize: 10,
                                                        margin: [5, 0, 0, 2],
                                                    },
                                                    {
                                                        text: reservation.zone.name,
                                                        fontSize: 10,
                                                        margin: [5, 0, 0, 0],
                                                    },
                                                ],
                                            },
                                            // Columna derecha: fecha y hora
                                            {
                                                width: '50%',
                                                stack: [
                                                    {
                                                        text: formattedDate,
                                                        fontSize: 10,
                                                        alignment: 'right',
                                                        margin: [0, 0, 5, 2],
                                                    },
                                                    {
                                                        text: formattedTime,
                                                        fontSize: 10,
                                                        alignment: 'right',
                                                        margin: [0, 0, 5, 0],
                                                    },
                                                ],
                                            },
                                        ],
                                        margin: [0, 0, 0, 5],
                                    },
                                ],
                                margin: [5, 5, 5, 5],
                            },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                },
            },
        ],
        defaultStyle: {
            font: 'Roboto',
        },
    };
};
