const nodemailer = require('nodemailer');
const { getDb } = require('../mongoConnection');

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

async function sendNotificationMail(email, subject, msg) {

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


// Fonction asynchrone pour envoyer des notifications d'expiration d'immatriculation
async function sendExpirationImmatriculationNotifications() {
    try {
        // Obtener la fecha actual
        const currentDate = new Date();
        // Création de la date dans 10 jours à partir de maintenant
        const tenDaysFromNow = new Date(currentDate.getTime());
        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
        // Réinitialisation des heures, minutes, secondes et millisecondes à 0 pour la date dans 10 jours (YYY-MM-DDT00:00:00.000Z)
        // tenDaysFromNow.setHours(0, 0, 0, 0);
        tenDaysFromNow.setUTCHours(0, 0, 0, 0);
        // Envoi des notifications pour la date dans 10 jours
        const tenDaysNotificationSent = await automaticNotificationSender(tenDaysFromNow);
        console.log(`${tenDaysNotificationSent} las notificaciones de 10 días fueron enviadas.`);

        // Création de la date dans 5 jours à partir de maintenant
        const fiveDaysFromNow = new Date(currentDate.getTime());
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
        // Réinitialisation des heures, minutes, secondes et millisecondes à 0 pour la date dans 5 jours
        // fiveDaysFromNow.setHours(0, 0, 0, 0);
        fiveDaysFromNow.setUTCHours(0, 0, 0, 0);
        // Envoi des notifications pour la date dans 5 jours
        const FiveDaysNotificationSent = await automaticNotificationSender(fiveDaysFromNow);
        console.log(`${FiveDaysNotificationSent} las notificaciones de 5 días fueron enviadas.`);

        // Création de la date d'hier
        const yesterday = new Date(currentDate.getTime());
        yesterday.setDate(currentDate.getDate() - 1);
        // Réinitialisation des heures, minutes, secondes et millisecondes à 0 pour la date d'hier
        yesterday.setHours(0, 0, 0, 0);
        // Envoi des notifications pour la date d'hier
        const expiredNotificationSent = await automaticNotificationSender(yesterday);
        console.log(`${expiredNotificationSent} las notificaciones de expiración fueron enviadas.`);


    } catch (error) {
        console.error(error);
    }
}

// Fonction asynchrone pour envoyer des notifications automatiques
async function automaticNotificationSender(notificationDate) {
    try {

        // Obtenir la date et l'heure actuelles
        const currentDate = new Date();
        // Vérifier si la notification est expirée
        const isExpired = notificationDate < currentDate;
        let vehiclesToNotify;

        // Récupérer les véhicules à notifier en fonction de la date de notification
        if (isExpired) {
            // Rechercher les véhicules dont la date d'expiration est antérieure ou égale à la date de notification
            vehiclesToNotify = await vehicleCollection.find({
                'immatriculation.dateExpiration': { $lte: notificationDate },
            }, {
                // Sélectionner uniquement les champs nécessaires pour la notification
                projection: {
                    owner: 1,
                    plate: 1,
                    immatriculation: 1,
                },
            }).toArray();

        } else {
            // Rechercher les véhicules dont la date d'expiration correspond à la date de notification
            vehiclesToNotify = await vehicleCollection.find({
                'immatriculation.dateExpiration': notificationDate,
            }, {
                projection: {
                    owner: 1,
                    plate: 1,
                    immatriculation: 1,
                },
            }).toArray();
        }

        let notificationsSent = 0;
        // Boucle à travers les véhicules à notifier
        for (const vehicle of vehiclesToNotify) {
            // Récupérer les informations du propriétaire du véhicule
            const owner = await userCollection.findOne({ _id: vehicle.owner });
            // Vérifier si le propriétaire existe et a un e-mail valide
            if (owner && owner.email) {
                // Préparer le contenu du courriel
                let subject = "Votre immatriculation est proche de l'expiration !";
                let expirationDate = vehicle.immatriculation.dateExpiration;
                let msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} et est sur le point d'expirer. Veuillez prendre les mesures nécessaires.`;
                // Modifier le sujet et le message si la notification est expirée
                if (isExpired) {
                    subject = "Votre immatriculation a expiré ";
                    expirationDate = vehicle.immatriculation.dateExpiration;
                    msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} a déjà expiré. Veuillez prendre les mesures nécessaires.`;

                }

                // Envoyer le courriel de notification
                await sendNotificationMail(owner.email, subject, msg);
                // Incrémenter le compteur de notifications envoyées
                notificationsSent++;
            }
        }
        // Retourner le nombre de notifications envoyées
        return notificationsSent;

    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    transporter,
    sendVerificationEmail,
    sendNotificationMail,
    sendExpirationEmail,
    sendExpirationImmatriculationNotifications

};

