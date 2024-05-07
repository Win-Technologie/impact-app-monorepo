const nodemailer = require('nodemailer');



let COMPANY_MAIL = process.env.EMAIL;
let COMP_MAIL_PASS = process.env.E_PSSWRD;
let COMPANY_SERVICE = process.env.E_SERVICE;

const transporter = nodemailer.createTransport({

    service: COMPANY_SERVICE,
    auth: {
        user: COMPANY_MAIL,
        pass: COMP_MAIL_PASS,
    },
}

);

// Envoyer les codes de vérification par courrier électronique
async function sendVerificationEmail(email, code) {
    // Configuration des paramètres de l'e-mail
    const mailOptions = {
        from: COMPANY_MAIL,
        to: email,
        subject: 'Code de vérification',
        html: `<p>Votre code de vérification est : <strong>${code}</strong></p>`
    };

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions);
}

async function sendNotificationMail(email, subject, msg){

    const mailOptions = {
        from: COMPANY_MAIL,
        to: email,
        subject: subject,
        html: `<p>${msg}</p>`
    };

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions);
}

async function sendExpirationEmail(email, plate) {
    try {
        // Configuration des paramètres de l'e-mail
        const mailOptions = {
            from: COMPANY_MAIL,
            to: email,
            subject: 'Expiration de l\'immatriculation',
            html: `<p>Votre immatriculation pour le véhicule avec la plaque ${plate} est sur le point d'expirer. Veuillez effectuer le renouvellement dès que possible.</p>`
        };

        // Envoyer l'e-mail
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email d'expiration :", error);
        throw new Error("Erreur lors de l'envoi de l'email d'expiration");
    }
}

module.exports = {
    transporter,
    sendVerificationEmail,
    sendNotificationMail,
    sendExpirationEmail
};
