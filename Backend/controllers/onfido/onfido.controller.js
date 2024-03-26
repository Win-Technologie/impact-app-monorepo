const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

// VARIABLES
const ONFIDO_API_TOKEN = process.env.ONFIDO_API_TOKEN;
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);

// Initialisez Onfido avec votre API token
const onfido = new Onfido({
    apiToken: ONFIDO_API_TOKEN,
    // Supports Region.EU, Region.US and Region.CA
    region: Region.CA
});




/**
 * Crée un nouveau candidat dans le système Onfido s'il n'existe pas déjà.
 * @param {*} newUser Les informations du nouvel utilisateur.
 * @returns {Object} Un objet contenant le résultat de l'opération.
 */
async function createApplicant(newUser) {
    try {
        const applicants = await onfido.applicant.list();

        for (const applicant of applicants) {
            if (applicant.email === newUser.email) {
                return { success: false, msg: "Utilisateur existant dans Onfido" };
            }
        }

        const newApplicant = await onfido.applicant.create({
            firstName: newUser.name,
            lastName: newUser.lastName,
            email: newUser.email,
            gender: newUser.gender,
            telephone: newUser.phone, 
            addresses: [{
                country: newUser.country,
                city: newUser.city,
                province: newUser.province,
                postcode: newUser.postalCode,
                street: newUser.address
            }]
        });

        // Assigner l'ID de l'applicant à newUser.applicantId
        newUser.applicantId = newApplicant.id;

        // Mise à jour du champ 'applicantId' dans la collection 'userCollection'
        await userCollection.updateOne(
            { email: newUser.email },
            { $set: { applicantId: newApplicant.id } }
        );

        return { success: true, msg: "Client ONFIDO créé avec succès"};
    } catch (error) {
        throw error;
    }
}


/**
 * Récupère tous les demandeurs Onfido
 * @param {Object} req Requête HTTP
 * @param {Object} res Réponse HTTP
 * @returns {Promise<void>} Retourne une promesse vide
 */
async function getAllApplicants(req, res) {
    try {
        // Récupérer la liste des candidats depuis Onfido
        const applicants = await onfido.applicant.list();

        // Retourner la liste des candidats dans la réponse
        return res.status(200).json(applicants);
    } catch (error) {
        console.error("Erreur lors de la récupération des demandeurs Onfido:", error);
        return res.status(500).json({ msg: "Erreur interne du serveur lors de la récupération des demandeurs Onfido" });
    }
}



/**
 * Supprime un demandeur Onfido en fonction de son email
 * @param {Object} req Requête HTTP
 * @param {Object} res Réponse HTTP
 * @returns {Promise<void>} Retourne une promesse vide
 */
async function deleteApplicantByEmail(req, res) {
    try {
        const applicantEmail = req.params.email;

        // Récupérer la liste des candidats depuis Onfido
        const applicants = await onfido.applicant.list();

        // Recherche du demandeur dans la liste par email
        let existingApplicant;
        for (const applicant of applicants) {
            if (applicant.email === applicantEmail) {
                existingApplicant = applicant;
            }
        }

        // Si le demandeur n'existe pas, retourne un msg d'erreur
        if (!existingApplicant) {
            return res.status(404).json({ msg: "Demandeur non trouvé dans Onfido" });
        }

        // Suppression du demandeur
        await onfido.applicant.delete(existingApplicant.id);
        return res.status(200).json({ msg: "Demandeur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du demandeur Onfido:", error);
        return res.status(500).json({ msg: "Erreur interne du serveur lors de la suppression du demandeur Onfido" });
    }
}



 

/**
 * Récupère un demandeur par son email
 * @param {*} req La requête HTTP
 * @param {*} res La réponse HTTP
 * @returns Le demandeur correspondant à l'email
 */
async function getApplicantByEmail(req, res) {
    try {
        // Récupère l'email à partir des paramètres de la requête
        const email = req.params.email;

        // Vérifie si l'utilisateur existe dans userCollection
        const existingUser = await userCollection.findOne({ email });

        // Si l'utilisateur existe dans userCollection, retournez-le
        if (!existingUser) {
            return res.status(404).json({ msg: "l'utilisateur n'existe pas dans la bas de donnée" });
        }

        // Récupérer la liste des candidats depuis Onfido
        const applicants = await onfido.applicant.list();

        // Recherche du demandeur dans la liste par email
        let existingApplicant;
        for (const applicant of applicants) {
            if (applicant.email === email) { // Utilisez la variable 'email' au lieu de 'applicantEmail'
                existingApplicant = applicant;
            }
        }

        // Si le demandeur existe, retournez-le
        if (existingApplicant) {
            return res.status(200).json(existingApplicant); // Retourne le demandeur trouvé dans Onfido
        }

        // Si le demandeur n'existe pas, retourne un msg d'erreur
        return res.status(404).json({ msg: "Demandeur non trouvé dans Onfido" });
      
    } catch (error) {
        console.error("Erreur lors de la récupération du demandeur par email :", error);
        return res.status(500).json({ msg: "Erreur interne du serveur lors de la récupération du demandeur par email" });
    }
}



/**
 * Vérifie le permis de conduire et l'assurance du véhicule.
 * @param {Object} req Requête HTTP
 * @param {Object} res Réponse HTTP
 * @returns {Promise<void>} Retourne une promesse vide
 */

async function verifyDocuments(user) {
    try {

        const applicantId = user.applicantId;

        const photosDirectory = '../../uploads/users/images/';

        // Construire le chemin absolu du dossier des photos
        const absolutePhotosDirectory = path.resolve(__dirname, photosDirectory);

        // Initialiser un tableau pour stocker les résultats de la vérification de chaque photo
        const verificationResults = [];

        // Parcourir chaque nom de photo dans le tableau user.photos
        for (const photoName of user.photos) {
            // Récupérer le chemin absolu de chaque photo
            const photoPath = path.join(absolutePhotosDirectory, photoName);

            // Lire le fichier de chaque photo
            const photoContent = await fs.readFile(photoPath);

            // Effectuez les vérifications nécessaires sur les fichiers téléchargés
            const verificationResult = await verifyDrivingLicense(photoContent, applicantId);
            //const verificationResult = await verifyVehicleInsurance(insuranceDocument);

            // Ajouter le résultat de vérification au tableau de résultats
            verificationResults.push(verificationResult);
        }

        // Renvoyer les résultats de vérification
        return {
            drivingLicense: verificationResults,
            //vehicleInsurance: vehicleInsuranceVerificationResult
        };
    } catch (error) {
        console.error("Erreur lors de la vérification des documents :", error);
        throw new Error("Erreur interne du serveur lors de la vérification des documents");
    }
}


/**
 * Vérifie le permis de conduire à partir de la photo.
 * @param {Object} drivingLicensePhoto Photo du permis de conduire
 * @param {string} userId ID de l'utilisateur
 * @param {Object} userData Données de l'utilisateur nécessaires à la vérification
 * @returns {Object} Résultat de la vérification du permis de conduire
 */
async function verifyDrivingLicense(drivingLicensePhoto, userId, userData) {
    try {
        // Soumettre la photo du permis de conduire à Onfido pour vérification
        const checkData = {
            applicantId: userId,
            reportNames: ["identity_enhanced"],
            applicantProvidesData: true, // Indique que l'applicant fournit les données
            userData: {
                drivingLicenseNumber: userData.drivingLicenseNumber, // Numéro de permis de conduire
                fullName: userData.fullName, // Nom complet du titulaire du permis
                dateOfIssue: userData.dateOfIssue, // Date de délivrance
                expirationDate: userData.expirationDate, // Date d'expiration
                categories: userData.categories, // Catégories de permis
            },
            file: drivingLicensePhoto // La photo du permis de conduire
        };

        const check = await onfido.check.create(checkData);

        // Vérifier le statut de la vérification
        if (check.status === 'complete' && check.result === 'clear') {
            return { success: true, msg: "Le permis de conduire est valide" };
        } else {
            console.log("Détails de l'erreur de vérification :", check); // Afficher les détails de l'erreur dans la console
            return { success: false, msg: "Le permis de conduire n'est pas valide" };
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du permis de conduire :", error);
        throw error;
    }
}



module.exports = {
    createApplicant,
    verifyDocuments,
    getApplicantByEmail,
    deleteApplicantByEmail,
    getAllApplicants,
    verifyDocuments
};

