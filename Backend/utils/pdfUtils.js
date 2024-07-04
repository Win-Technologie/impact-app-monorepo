const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Génère un PDF de constat amiable d'accident du Québec
 * @param {*} reportData 
 * @returns {Uint8Array} pdfBytes - Les octets du PDF généré
 */
async function generatePDF(reportData) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Taille A4 en points
    const { width, height } = page.getSize();
    const fontSize = 10;

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // Titre
    page.drawText('Constat Amiable d\'Accident', {
        x: 50,
        y: height - 50,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
    });

    let yPosition = height - 80;

    // Informations sur l'accident
    page.drawText(`Date de l'accident : ${reportData.accidentDate.toDateString()}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(`Heure de l'accident : ${reportData.hourAccident}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(`Lieu de l'accident : ${reportData.accidentLocation}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Informations sur les véhicules et les conducteurs
    reportData.vehicles.forEach((vehicle, index) => {
        page.drawText(`Véhicule ${index + 1}`, {
            x: 50,
            y: yPosition,
            size: fontSize + 2,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Propriétaire : ${vehicle.personalDetails.name} ${vehicle.personalDetails.lastName}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Adresse : ${vehicle.personalDetails.address}, ${vehicle.personalDetails.city}, ${vehicle.personalDetails.province}, ${vehicle.personalDetails.country}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Téléphone : ${vehicle.personalDetails.phone}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Email : ${vehicle.personalDetails.email}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Véhicule : ${vehicle.vehicleDetails.registrationCertificate.vehicleBrand}, ${vehicle.vehicleDetails.registrationCertificate.year}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Numéro d'immatriculation : ${vehicle.vehicleDetails.registrationCertificate.licensePlateNumber}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Compagnie d'assurance : ${vehicle.vehicleDetails.insuranceCertification.insuranceCompany}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 40;
    });

    // Ajout de la description des dommages
    page.drawText('Description des dommages :', {
        x: 50,
        y: yPosition,
        size: fontSize + 2,
        font: boldFont,
        color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(reportData.vehicleDamageDescription, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    // Sauvegarde du PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

module.exports = {
    generatePDF
};
