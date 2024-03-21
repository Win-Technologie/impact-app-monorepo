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

module.exports = {
    transporter,
    sendVerificationEmail
};
