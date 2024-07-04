const nodemailer = require('nodemailer');
const { getDb } = require('../mongoConnection');

const path = require('path');
const fs = require('fs');

let COMPANY_MAIL = process.env.EMAIL;
let COMP_MAIL_PASS = process.env.E_PSSWRD;
let COMPANY_SERVICE = process.env.E_SERVICE;

const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;

const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

const transporter = nodemailer.createTransport({
    service: COMPANY_SERVICE,
    auth: {
        user: COMPANY_MAIL,
        pass: COMP_MAIL_PASS,
    },
});

// Envoyer les codes de vérification par courrier électronique
async function sendVerificationEmail(email, code) {
    const mailOptions = {
        from: COMPANY_MAIL,
        to: email,
        subject: 'Code de vérification',
        html: `<p>Votre code de vérification est : <strong>${code}</strong></p>`
    };
    await transporter.sendMail(mailOptions);
}

async function sendNotificationMail(email, subject, msg) {
    const mailOptions = {
        from: COMPANY_MAIL,
        to: email,
        subject: subject,
        html: `<p>${msg}</p>`
    };
    await transporter.sendMail(mailOptions);
}

async function sendExpirationEmail(email, plate) {
    try {
        const mailOptions = {
            from: COMPANY_MAIL,
            to: email,
            subject: 'Expiration de l\'immatriculation',
            html: `<p>Votre immatriculation pour le véhicule avec la plaque ${plate} est sur le point d'expirer. Veuillez effectuer le renouvellement dès que possible.</p>`
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email d'expiration :", error);
        throw new Error("Erreur lors de l'envoi de l'email d'expiration");
    }
}

async function sendAccidentReportByEmail(emails, pdfBytes, photoPaths) {
    const attachments = [
        {
            filename: 'constat_amiable.pdf',
            content: pdfBytes,
            contentType: 'application/pdf'
        }
    ];

    // Ajouter les photos en pièces jointes
    photoPaths.forEach(photoPath => {
        attachments.push({
            filename: path.basename(photoPath), // Utilisez le nom de fichier de base
            path: photoPath // Chemin absolu vers le fichier photo sur votre système
        });
    });

    const mailOptions = {
        from: COMPANY_MAIL,
        to: emails.join(', '),
        subject: 'Constat Amiable d\'Accident',
        text: 'Veuillez trouver ci-joint le constat amiable d\'accident.',
        attachments: attachments
    };

    await transporter.sendMail(mailOptions);
}



module.exports = {
    transporter,
    sendVerificationEmail,
    sendNotificationMail,
    sendExpirationEmail,
    sendAccidentReportByEmail
};
