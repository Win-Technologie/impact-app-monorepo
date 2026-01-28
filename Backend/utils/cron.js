const nodemailer = require("nodemailer");
const { getDb } = require("../mongoConnection");
const { sendNotificationMail } = require("./nodemailer");

let COMPANY_MAIL = process.env.EMAIL;
let COMP_MAIL_PASS = process.env.E_PSSWRD;
let COMPANY_SERVICE = process.env.E_SERVICE;

const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;
const DRIVERLICENSECOLLECTION = process.env.DRIVERSLICENSECOLLECTION;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;

const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);
const drivingLicensesCollection = mainDb.collection(DRIVERLICENSECOLLECTION);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);

/**
 * Cette fonction envoie des notifications d'expiration d'immatriculation.
 * Elle récupère la date actuelle, calcule les dates de notification pour les prochains 10 jours,
 * 5 jours et  le jour précédent.(expired ones), puis envoie les notifications correspondantes.
 * @returns Un objet contenant le nombre de notifications envoyées pour chaque échéance.
 */
async function sendExpirationImmatriculationNotifications() {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();
    // Calculer les dates de notification pour les prochains 10 jours, 5 jours et  le jour précédent(expired ones).
    const notificationDates = [
      calculateNotificationDate(currentDate, 10),
      calculateNotificationDate(currentDate, 5),
      calculateNotificationDate(currentDate, -1),
    ];

    // // Mapper les dates de notification à des promesses d'envoi de notifications
    const promises = notificationDates.map(async (notificationDate) => {
      // Récupérer les véhicules à notifier pour la date donnée
      const vehiclesToNotify = await getVehiclesToNotify(notificationDate);
      // Vérifier si la date de notification est expirée ou non
      const isExpired = notificationDate < currentDate;
      // Traiter les véhicules à notifier et retourner le nombre de notifications envoyées
      const notificationsSent = await processVehicles(
        vehiclesToNotify,
        isExpired,
      );
      return notificationsSent;
    });

    // Attendre l'exécution de toutes les promesses et obtenir les résultats
    const results = await Promise.all(promises);

    // Afficher les résultats
    console.log(`${results[0]} notifications for 10 days were sent.`);
    console.log(`${results[1]} notifications for 5 days were sent.`);
    console.log(`${results[2]} expiration notifications were sent.`);

    // Retourner les résultats
    return {
      tenDaysNotificationSent: results[0],
      FiveDaysNotificationSent: results[1],
      expiredNotificationSent: results[2],
    };
  } catch (error) {
    console.error(
      "Error executing the cron task to send expiration notifications:",
      error,
    );
  }
}

async function sendExpirationDriverLicensesNotifications() {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();
    // Calculer les dates de notification pour les prochains 10 jours, 5 jours et  le jour précédent(expired ones).
    const notificationDates = [
      calculateNotificationDate(currentDate, 10),
      calculateNotificationDate(currentDate, 5),
      calculateNotificationDate(currentDate, -1),
    ];

    // // Mapper les dates de notification à des promesses d'envoi de notifications
    const promises = notificationDates.map(async (notificationDate) => {
      // Récupérer les véhicules à notifier pour la date donnée
      const driverLicensesToNotify =
        await getDriverLicensesToNotify(notificationDate);
      // Vérifier si la date de notification est expirée ou non
      const isExpired = notificationDate < currentDate;
      // Traiter les véhicules à notifier et retourner le nombre de notifications envoyées
      const notificationsSent = await processDriverLicenses(
        driverLicensesToNotify,
        isExpired,
      );
      return notificationsSent;
    });

    // Attendre l'exécution de toutes les promesses et obtenir les résultats
    const results = await Promise.all(promises);

    console.log("DRIVING LICENCES EXPIRING CHECK ... ");
    // Afficher les résultats
    console.log(`${results[0]} notifications for 10 days were sent.`);
    console.log(`${results[1]} notifications for 5 days were sent.`);
    console.log(`${results[2]} expiration notifications were sent.`);

    // Retourner les résultats
    return {
      tenDaysNotificationSent: results[0],
      FiveDaysNotificationSent: results[1],
      expiredNotificationSent: results[2],
    };
  } catch (error) {
    console.error(
      "Error executing the cron task to send expiration notifications:",
      error,
    );
  }
}

async function sendExpirationInsuranceNotifications() {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();
    // Calculer les dates de notification pour les prochains 10 jours, 5 jours et  le jour précédent(expired ones).
    const notificationDates = [
      calculateNotificationDate(currentDate, 10),
      calculateNotificationDate(currentDate, 5),
      calculateNotificationDate(currentDate, -1),
    ];

    // // Mapper les dates de notification à des promesses d'envoi de notifications
    const promises = notificationDates.map(async (notificationDate) => {
      // Récupérer les véhicules à notifier pour la date donnée
      const insurancesToNotify = await getInsurancesToNotify(notificationDate);
      // Vérifier si la date de notification est expirée ou non
      const isExpired = notificationDate < currentDate;
      // Traiter les véhicules à notifier et retourner le nombre de notifications envoyées
      const notificationsSent = await processInsurances(
        insurancesToNotify,
        isExpired,
      );
      return notificationsSent;
    });

    // Attendre l'exécution de toutes les promesses et obtenir les résultats
    const results = await Promise.all(promises);

    console.log("INSURANCES EXPIRING CHECK ... ");
    // Afficher les résultats
    console.log(`${results[0]} notifications for 10 days were sent.`);
    console.log(`${results[1]} notifications for 5 days were sent.`);
    console.log(`${results[2]} expiration notifications were sent.`);

    // Retourner les résultats
    return {
      tenDaysNotificationSent: results[0],
      FiveDaysNotificationSent: results[1],
      expiredNotificationSent: results[2],
    };
  } catch (error) {
    console.error(
      "Error executing the cron task to send expiration notifications:",
      error,
    );
  }
}

/**
 * Cette fonction récupère les véhicules à notifier pour une date donnée.
 * Elle vérifie si la date de notification est antérieure à la date actuelle
 * pour déterminer si les véhicules sont expirés ou non.
 * @param {Date} notificationDate - La date de notification
 * @returns Les véhicules à notifier
 */
async function getVehiclesToNotify(notificationDate) {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();
    // Vérifier si la date de notification est expirée ou non
    const isExpired = notificationDate < currentDate;
    // console.log(isExpired);
    // Construire la requête de recherche en fonction de la date de notification
    const query = isExpired
      ? { "immatriculation.dateExpiration": { $lte: notificationDate } }
      : { "immatriculation.dateExpiration": notificationDate };
    // Récupérer les véhicules à notifier
    const vehiclesToNotify = await vehicleCollection
      .find(query, {
        projection: {
          owner: 1,
          plate: 1,
          immatriculation: 1,
        },
      })
      .toArray();

    return vehiclesToNotify;
  } catch (error) {
    console.error("Error fetching vehicles to notify:", error);
    throw error;
  }
}

async function getDriverLicensesToNotify(notificationDate) {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();
    // Vérifier si la date de notification est expirée ou non
    const isExpired = notificationDate < currentDate;
    // console.log(isExpired);
    // Construire la requête de recherche en fonction de la date de notification
    const query = isExpired
      ? { expires: { $lte: notificationDate } }
      : { expires: notificationDate };
    // Récupérer les driver licenses à notifier
    const driverLicensesToNotify = await drivingLicensesCollection
      .find(query, {
        projection: {
          user: 1,
          number: 1,
          expires: 1,
          // licenseClass: 1,
        },
      })
      .toArray();

    return driverLicensesToNotify;
  } catch (error) {
    console.error("Error fetching driving licences to notify:", error);
    throw error;
  }
}

async function getInsurancesToNotify(notificationDate) {
  try {
    // Récupérer la date actuelle
    const currentDate = new Date();
    // Vérifier si la date de notification est expirée ou non
    const isExpired = notificationDate < currentDate;
    // console.log(isExpired);
    // Construire la requête de recherche en fonction de la date de notification
    const query = isExpired
      ? { expirationDate: { $lte: notificationDate } }
      : { expirationDate: notificationDate };
    // Récupérer les driver licenses à notifier
    const insurancesToNotify = await insuranceCollection
      .find(query, {
        projection: {
          subscriber: 1,
          insuranceNumber: 1,
          expirationDate: 1,
          insuranceCompany: 1,
          // licenseClass: 1,
        },
      })
      .toArray();

    return insurancesToNotify;
  } catch (error) {
    console.error("Error fetching driving licences to notify:", error);
    throw error;
  }
}

/**
 * Cette fonction traite les véhicules à notifier en envoyant des notifications par email.
 * Elle détermine le sujet et le contenu du message en fonction de la date d'expiration du véhicule.
 * @param {Object[]} vehiclesToNotify - Les véhicules à notifier
 * @param {boolean} isExpired - Indique si la date de notification est expirée
 * @returns Le nombre de notifications envoyées
 */
async function processVehicles(vehiclesToNotify, isExpired) {
  try {
    let notificationsSent = 0;
    for (const vehicle of vehiclesToNotify) {
      const owner = await userCollection.findOne({ _id: vehicle.owner });
      if (owner && owner.email) {
        // console.log(owner.name);
        // // Déterminer le sujet et le contenu du message en fonction de la date d'expiration du véhicule
        const subject = isExpired
          ? "Your registration has expired"
          : "Your registration is about to expire!";
        const expirationDate = vehicle.immatriculation.dateExpiration;
        const msg = isExpired
          ? `Hello ${owner.name}, the registration number of your vehicle with the plate ${vehicle.plate} has an expiration date of ${expirationDate} and has already expired. Please take the necessary actions.`
          : `Hello ${owner.name}, the registration number of your vehicle with the plate ${vehicle.plate} has an expiration date of ${expirationDate} and is about to expire. Please take the necessary actions.`;

        // Envoyer la notification par email
        await sendNotificationMail(owner.email, subject, msg);
        notificationsSent++;
      }
    }
    return notificationsSent;
  } catch (error) {
    console.error("Error processing vehicles:", error);
    throw error;
  }
}

async function processDriverLicenses(driverLicensesToNotify, isExpired) {
  try {
    console.log("hello from driver license check");
    let notificationsSent = 0;
    for (const lincese of driverLicensesToNotify) {
      console.log(lincese);
      const user = await userCollection.findOne({ _id: lincese.user });
      if (user && user.email) {
        // console.log(user.name);
        // Déterminer le sujet et le contenu du message en fonction de la date d'expiration du permis de conduire
        const subject = isExpired
          ? "Your driving license has expired!"
          : "Your driving license is about to expire!";
        const expirationDate = lincese.expires;
        console.log(expirationDate);
        const msg = isExpired
          ? `Hello ${user.name}, your driving license with number ${lincese.number} has an expiration date of ${expirationDate} and has already expired. Please take the necessary actions.`
          : `Hello ${user.name}, your driving license with number ${lincese.number} has an expiration date of ${expirationDate} and is about to expire. Please take the necessary actions.`;

        // console.log("subject : ", subject);
        // console.log("msg : ", msg);
        // Envoyer la notification par email
        await sendNotificationMail(user.email, subject, msg);
        notificationsSent++;
      }
    }
    return notificationsSent;
  } catch (error) {
    console.error("Error processing vehicles:", error);
    throw error;
  }
}

async function processInsurances(insurancesToNotify, isExpired) {
  try {
    // console.log("hello from process insurances");
    let notificationsSent = 0;
    for (const insurance of insurancesToNotify) {
      // console.log(insurance);
      const user = await userCollection.findOne({ _id: insurance.subscriber });
      if (user && user.email) {
        // console.log(user.name);
        // Déterminer le sujet et le contenu du message en fonction de la date d'expiration du permis de conduire
        const subject = isExpired
          ? "Your your insurance has expired!"
          : "Your your insurance is about to expire!";
        const expirationDate = insurance.expirationDate;
        // console.log(expirationDate);
        const msg = isExpired
          ? `Hello ${user.name}, your insurance with number ${insurance.insuranceNumber} has an expiration date of ${expirationDate} and has already expired. Please take the necessary actions.`
          : `Hello ${user.name}, your insurance with number ${insurance.insuranceNumber} has an expiration date of ${expirationDate} and is about to expire. Please take the necessary actions.`;

        // console.log("subject : ", subject);
        // console.log("msg : ", msg);
        // Envoyer la notification par email
        await sendNotificationMail(user.email, subject, msg);
        notificationsSent++;
      }
    }
    return notificationsSent;
  } catch (error) {
    console.error("Error processing vehicles:", error);
    throw error;
  }
}

/**
 * Cette fonction calcule la date de notification en ajoutant un certain nombre de jours à la date actuelle.
 * Elle réinitialise les heures, les minutes, les secondes et les millisecondes à 0.
 * @param {Date} currentDate - La date actuelle
 * @param {number} daysToAdd - Le nombre de jours à ajouter
 * @returns La date de notification calculée
 */
function calculateNotificationDate(currentDate, daysToAdd) {
  const notificationDate = new Date(currentDate.getTime());
  notificationDate.setDate(notificationDate.getDate() + daysToAdd);
  notificationDate.setUTCHours(0, 0, 0, 0);
  // console.log("currentDate : ", currentDate);
  // console.log("notificationDate : ", notificationDate);
  return notificationDate;
}

module.exports = {
  sendExpirationImmatriculationNotifications,
  sendExpirationDriverLicensesNotifications,
  sendExpirationInsuranceNotifications,
};
