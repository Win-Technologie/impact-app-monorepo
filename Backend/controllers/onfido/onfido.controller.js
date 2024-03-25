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
                // L'utilisateur a été trouvé, retourner un message
                return { message: "Utilisateur existant dans Onfido" };
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
        return res.status(500).json({ message: "Erreur interne du serveur lors de la récupération des demandeurs Onfido" });
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

        // Si le demandeur n'existe pas, retourne un message d'erreur
        if (!existingApplicant) {
            return res.status(404).json({ message: "Demandeur non trouvé dans Onfido" });
        }

        // Suppression du demandeur
        await onfido.applicant.delete(existingApplicant.id);
        return res.status(200).json({ message: "Demandeur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du demandeur Onfido:", error);
        return res.status(500).json({ message: "Erreur interne du serveur lors de la suppression du demandeur Onfido" });
    }
}





/**
 * 
 * @param {*} user 
 * @returns 
 */
async function verifyDocuments(user) {
    try {
        // Vérification du document d'assurance
        const insuranceDocumentResult = await Document.upload({
            type: "insurance_document", // Type de document : document d'assurance
            file: "URL_DU_FICHIER_DOCUMENT_ASSURANCE" // URL du fichier du document d'assurance
        });

        // Vérification de la photo du permis de conduire
        const drivingLicencePhotoResult = await Document.upload({
            type: "driving_licence", // Type de document : permis de conduire
            file: "URL_DU_FICHIER_PHOTO_PERMIS" // URL de l'image/photo du permis de conduire
        });

        return { insuranceDocumentResult, drivingLicencePhotoResult };
    } catch (error) {
        throw error;
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
        if (existingUser) {
            return { message: "Utilisateur existant dans userCollection" };
        }

        // Si l'utilisateur n'existe pas dans userCollection, recherchez-le dans Onfido
        const applicant = await applicant.find({
            email: email
        });

        return applicant;
    } catch (error) {
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
