const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

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
        // Récupérer la liste des candidats depuis Onfido
        const applicants = await onfido.applicant.list();

        // Parcourir la liste des candidats pour vérifier si l'utilisateur existe
        for (const applicant of applicants) {
            if (applicant.email === newUser.email) {
                // L'utilisateur a été trouvé, retourner un msg
                return { msg: "Utilisateur existant dans Onfido" };
            }
        }

        // Créer un nouvel applicant dans Onfido
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

        // Retourner un objet contenant le résultat de la création du candidat
        return { msg: "Client ONFIDO créé avec succès" };
    } catch (error) {
        throw error; // Renvoyer l'erreur pour qu'elle soit traitée à un niveau supérieur
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

        const insuranceDocument = user.documents;
        const drivingLicensePhoto = user.photo;


        // Effectuez les vérifications nécessaires sur les fichiers téléchargés
        const drivingLicenseVerificationResult = await verifyDrivingLicense(drivingLicensePhoto);
        const vehicleInsuranceVerificationResult = await verifyVehicleInsurance(insuranceDocument);

        // Renvoyer les résultats de vérification
        return res.status(200).json({
            drivingLicense: drivingLicenseVerificationResult,
            vehicleInsurance: vehicleInsuranceVerificationResult
        });
    } catch (error) {
        console.error("Erreur lors de la vérification des documents :", error);
        return res.status(500).json({ msg: "Erreur interne du serveur lors de la vérification des documents" });
    }
}



/**
 * Vérifie le permis de conduire à partir de la photo.
 * @param {Object} drivingLicensePhoto Photo du permis de conduire
 * @returns {Object} Résultat de la vérification du permis de conduire
 */
async function verifyDrivingLicense(drivingLicensePhoto) {
    try {
        // Soumettez la photo du permis de conduire à Onfido pour vérification
        const check = await onfido.document.check({
            file: drivingLicensePhoto, // La photo du permis de conduire
            type: "driving_licence" // Type de document à vérifier
        });

        // Vérifiez le statut de la vérification
        if (check.result === "clear") {
            return { success: true, msg: "Le permis de conduire est valide" };
        } else {
            return { success: false, msg: "Le permis de conduire n'est pas valide" };
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du permis de conduire :", error);
        throw error;
    }
}


/**
 * Vérifie l'assurance du véhicule à partir du document.
 * @param {Object} vehicleInsuranceDocument Document d'assurance du véhicule
 * @returns {Object} Résultat de la vérification de l'assurance du véhicule
 */
async function verifyVehicleInsurance(vehicleInsuranceDocument) {
    try {
        // Soumettez le document d'assurance du véhicule à Onfido pour vérification
        const check = await onfido.document.check({
            file: vehicleInsuranceDocument, // Le document d'assurance du véhicule
            type: "driving_licence" // Type de document à vérifier (cela peut varier selon le type de document d'assurance)
        });

        // Vérifiez le statut de la vérification
        if (check.result === "clear") {
            return { success: true, msg: "L'assurance du véhicule est valide" };
        } else {
            return { success: false, msg: "L'assurance du véhicule n'est pas valide" };
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de l'assurance du véhicule :", error);
        throw error;
    }
}


module.exports = {
    createApplicant,
    verifyDocuments,
    getApplicantByEmail,
    deleteApplicantByEmail,
    getAllApplicants
};

