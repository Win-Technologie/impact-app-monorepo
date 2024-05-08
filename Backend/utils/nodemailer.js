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



/*
// Fonction asynchrone pour envoyer des notifications d'expiration d'immatriculation
async function sendExpirationImmatriculationNotifications() {
    try {
// Obtenez la date actuelle
        const currentDate = new Date();
        const tenDaysFromNow = new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 jours à partir de maintenant

        // Consulta para encontrar vehículos con fecha de expiración cercana
        const vehiclesToNotify = await vehicleCollection.find({
            'immatriculation.dateExpiration': { $lte: tenDaysFromNow.toISOString() }
        }, {
            projection:
            {
                owner: 1, // Inclure l'ID du propriétaire du véhicule
                plate:1, // Inclure la plaque d'immatriculation du véhicule
                immatriculation: 1 // Inclure les détails d'immatriculation du véhicule

            }
        }).toArray();

        let notificationsSent = 0; // Initialiser le compteur de notifications envoyées

        // Pour chaque véhicule, envoyer une notification au propriétaire
        for (const vehicle of vehiclesToNotify) {
            console.log(vehicle);
            // Recherchez le propriétaire dans la collection des utilisateurs
            const owner = await userCollection.findOne({ _id: vehicle.owner });
            // Si le propriétaire et son adresse e-mail existent
            if (owner && owner.email) {

                // Construire le sujet du courrier électronique
                const subject = "Votre immatriculation est proche de l'expiration !";
                // Récupérer la date d'expiration du véhicule
                const expirationDate = vehicle.immatriculation.dateExpiration;
                // Construire le message de notification avec les détails
                const msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} et est sur le point d'expirer. Veuillez prendre les mesures nécessaires.`;
              // Envoyer le courrier électronique de notification
                await sendNotificationMail(owner.email, subject, msg);
                // Incrémenter le compteur de notifications envoyées
                notificationsSent++;
            }
        }

        return notificationsSent; // Retourner le nombre de notifications envoyées

    } catch (error) {
        console.error(error);
    }
}
*/


// Fonction asynchrone pour envoyer des notifications d'expiration d'immatriculation
// Función asincrónica para enviar notificaciones de expiración de inmatriculación
async function sendExpirationImmatriculationNotifications() {
    try {
        // Obtener la fecha actual
        const currentDate = new Date();

        const tenDaysFromNow = new Date(currentDate.getTime());
        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
        tenDaysFromNow.setHours(0, 0, 0, 0);
        
        const tenDaysNotificationSent = await automaticNotificationSender(tenDaysFromNow);
        console.log(`${tenDaysNotificationSent} las notificaciones de 10 días fueron enviadas.`);

        const fiveDaysFromNow = new Date(currentDate.getTime());
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
        fiveDaysFromNow.setHours(0, 0, 0, 0);
        const FiveDaysNotificationSent = await automaticNotificationSender(fiveDaysFromNow);
        console.log(`${FiveDaysNotificationSent} las notificaciones de 5 días fueron enviadas.`);

        const yesterday = new Date(currentDate.getTime());
        yesterday.setDate(currentDate.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const expiredNotificationSent = await automaticNotificationSender(yesterday);
        console.log(`${expiredNotificationSent} las notificaciones de expiración fueron enviadas.`);

        return { tenDaysNotificationSent, FiveDaysNotificationSent, expiredNotificationSent };

    } catch (error) {
        console.error(error);
    }
}

// Función asincrónica para enviar notificaciones automáticas
async function automaticNotificationSender(notificationDate) {
    try {

        const currentDate = new Date(); // Obtener la fecha actual
        const isExpired = notificationDate < currentDate;
        let vehiclesToNotify;

        console.log("===>>> notificationDate : ",notificationDate);

        if (isExpired) {
             vehiclesToNotify = await vehicleCollection.find({
                'immatriculation.dateExpiration': { $lte: notificationDate }, // Fecha de expiración menor o igual a la fecha de notificación
            }, {
                projection: {
                    owner: 1,
                    plate: 1,
                    immatriculation: 1,
                },
            }).toArray();

        } else {
            console.log("From notifications beyond actual date");
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

        // console.log(vehiclesToNotify);

        let notificationsSent = 0;

        for (const vehicle of vehiclesToNotify) {
            const owner = await userCollection.findOne({ _id: vehicle.owner });
            if (owner && owner.email) {
                // // Preparar el correo electrónico
                // let subject = "Votre immatriculation est proche de l'expiration !";
                // let expirationDate = vehicle.immatriculation.dateExpiration;
                // let msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} et est sur le point d'expirer. Veuillez prendre les mesures nécessaires.`;

                // if (isExpired) {
                //     subject = "Votre immatriculation a expiré ";
                //     expirationDate = vehicle.immatriculation.dateExpiration;
                //     msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} a déjà expiré. Veuillez prendre les mesures nécessaires.`;

                // }

                // // Enviar el correo electrónico
                // await sendNotificationMail(owner.email, subject, msg);
                
                notificationsSent++;
            }
        }

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




/*
async function automaticNotificationSender(daysFromNow) {

    const currentDate = new Date();

    console.log(daysFromNow.toISOString());

    // const vehiclesToNotify = await vehicleCollection.find({
    //     'immatriculation.dateExpiration': daysFromNow.toISOString()
    // }, {
    //     projection:
    //     {
    //         owner: 1, // Inclure l'ID du propriétaire du véhicule
    //         plate: 1, // Inclure la plaque d'immatriculation du véhicule
    //         immatriculation: 1 // Inclure les détails d'immatriculation du véhicule

    //     }
    // }
    // ).toArray();

    const vehiclesToNotify = await vehicleCollection.find({
        'immatriculation.dateExpiration': { $lte: daysFromNow.toISOString() }
    }, {
        projection:
        {
            owner: 1, // Inclure l'ID du propriétaire du véhicule
            plate:1, // Inclure la plaque d'immatriculation du véhicule
            immatriculation: 1 // Inclure les détails d'immatriculation du véhicule

        }
    }).toArray();

    console.log(vehiclesToNotify);

    let notificationsSent = 0; // Initialiser le compteur de notifications envoyées

    // Pour chaque véhicule, envoyer une notification au propriétaire
    for (const vehicle of vehiclesToNotify) {
        // Recherchez le propriétaire dans la collection des utilisateurs
        const owner = await userCollection.findOne({ _id: vehicle.owner });
        // Si le propriétaire et son adresse e-mail existent
        if (owner && owner.email) {
            // Construire le sujet du courrier électronique
            let subject = "Votre immatriculation est proche de l'expiration !";
            // Récupérer la date d'expiration du véhicule
            let expirationDate = vehicle.immatriculation.dateExpiration;
            // Construire le message de notification avec les détails
            let msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} et est sur le point d'expirer. Veuillez prendre les mesures nécessaires.`;

            if (daysFromNow === currentDate) {
                 subject = "Votre immatriculation expire aujourd'hui!";
                // Récupérer la date d'expiration du véhicule
                 expirationDate = vehicle.immatriculation.dateExpiration;
                // Construire le message de notification avec les détails
                 msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} et expire aujourd'hui. Veuillez prendre les mesures nécessaires.`;
            }

            if(daysFromNow < currentDate){
                subject = "Votre immatriculation a expiré ";
                // Récupérer la date d'expiration du véhicule
                 expirationDate = vehicle.immatriculation.dateExpiration;
                // Construire le message de notification avec les détails
                 msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} a déjà expiré. Veuillez prendre les mesures nécessaires.`;
            }

            // Envoyer le courrier électronique de notification
            await sendNotificationMail(owner.email, subject, msg);
            // Incrémenter le compteur de notifications envoyées
            notificationsSent++;
        }
    }

    return notificationsSent;
}
*/

/*
async function automaticNotificationSender(notificationDate) {
    try {
        const currentDate = new Date();
        let searchDate = new Date();

        if (typeof notificationDate === 'number') {
            // Si notificationDate es un número, sumarlo a la fecha actual
            searchDate.setDate(currentDate.getDate() + notificationDate);
        } else if (notificationDate instanceof Date) {
            // Si notificationDate es una instancia de Date, usar esa fecha
            searchDate = notificationDate;
        } else {
            throw new Error('El parámetro notificationDate debe ser un número o una instancia de Date.');
        }

        const vehiclesToNotify = await vehicleCollection.find({
            'immatriculation.dateExpiration': { $lte: searchDate.toISOString() }
        }, {
            projection: {
                owner: 1,
                plate: 1,
                immatriculation: 1
            }
        }).toArray();

        let notificationsSent = 0;

        for (const vehicle of vehiclesToNotify) {
            const owner = await userCollection.findOne({ _id: vehicle.owner });
            if (owner && owner.email) {
                let subject = "Votre immatriculation est proche de l'expiration !";
                let expirationDate = vehicle.immatriculation.dateExpiration;
                let msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} et est sur le point d'expirer. Veuillez prendre les mesures nécessaires.`;

                if (searchDate < currentDate) {
                    subject = "Votre immatriculation a expiré ";
                    expirationDate = vehicle.immatriculation.dateExpiration;
                    msg = `Bonjour ${owner.name}, le numéro d'immatriculation de votre véhicule avec la plaque ${vehicle.plate} a une date d'expiration du ${expirationDate} a déjà expiré. Veuillez prendre les mesures nécessaires.`;
                }

                await sendNotificationMail(owner.email, subject, msg);
                notificationsSent++;
            }
        }

        return notificationsSent;

    } catch (error) {
        console.error(error);
    }
}
*/