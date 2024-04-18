const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

// VARIABLES
const ONFIDO_API_TOKEN = process.env.ONFIDO_API_TOKEN;
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const DOCPATH = process.env.USER_CONTROLLER_IMG_PATHX2;
const CONNECTION_PATH = process.env.BASE_PATH;
const PORT = process.env.PORT;
const DOCBASICPATH = process.env.USER_DOC_PATH;



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
 * 
 * @param {*} newUser 
 * @returns 
 */
async function createApplicant01(newUser, driverLicense) {
    try {

        const applicants = await onfido.applicant.list();

        for (const applicant of applicants) {
            if (applicant.email === newUser.email) {
                return { success: false, msg: "Utilisateur existant dans Onfido" };
            }
        }

        if(driverLicense.sex == "M"){
            driverLicense.sex = "Male"
        }
                if(driverLicense.sex == "F"){
            driverLicense.sex = "Female"
        }

        console.log("DEBUG CREATE APLICANT BEFOR ");
        const newApplicant = await onfido.applicant.create({
            firstName: newUser.name,
            lastName: newUser.lastName,
            email: newUser.email,
            // gender: newUser.gender,
            gender: driverLicense.sex,
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

        console.log(newApplicant);

        console.log("DEBUG CREATE APLICANT AFTER ");

       // Mise à jour du champ 'applicantId' dans la collection 'userCollection'
        await userCollection.updateOne(
            { email: newUser.email },
            { $set: { applicantId: newApplicant.id } }
        );

        return { success: true, msg: "Client ONFIDO créé avec succès" };
    } catch (error) {
        throw error;
    }
}

/**
 * 
 * @param {*} myUser 
 * @returns 
 */
async function createApplicant(myUser, driverLicense) {
    try {

        const applicants = await onfido.applicant.list();

        // for (const applicant of applicants) {
        //     if (applicant.email === myUser.email) {
        //         return { success: false, msg: "Utilisateur existant dans Onfido" };
        //     }
        // }

        if (driverLicense.sex == "M") {
            driverLicense.sex = "Male"
        }
        if (driverLicense.sex == "F") {
            driverLicense.sex = "Female"
        }

        // console.log(driverLicense.sex );
        const newApplicant = await onfido.applicant.create({
            firstName: myUser.name,
            lastName: myUser.lastName,
            email: myUser.email,
            // gender: myUser.gender,
            gender: driverLicense.sex,
            telephone: myUser.phone,
            addresses: [{
                country: driverLicense.country,
                city: driverLicense.city,
                province: driverLicense.province,
                postcode: driverLicense.postalCode,
                street: driverLicense.address
            }]
        });

        // Assigner l'ID de l'applicant à myUser.applicantId
        myUser.applicantId = newApplicant.id;

        // console.log(newApplicant);

       // Mise à jour du champ 'applicantId' dans la collection 'userCollection'
        await userCollection.updateOne(
            { email: myUser.email },
            { $set: { applicantId: newApplicant.id } }
        );

       return { success: true, msg: "Client ONFIDO créé avec succès", applicantId: newApplicant.id };
        // return true;

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
 * Vérifie le permis de conduire d'un demandeur Onfido
 * @param {Object} req L'objet de requête HTTP
 * @param {Object} res L'objet de réponse HTTP
 * @returns {Promise<Object>} Retourne un objet contenant le résultat de la vérification
 */
async function verifyDrivingLicense(req, res) {
    try {
        const { applicant_id } = req.body;

        // Construire le chemin complet de l'image
        const imagePath = path.join(__dirname, '../../../uploads/users/images/', "d0UuJ3ZrFPU0S3Pfs-ptBYr0.jpg");

        // Utilisez l'API Onfido pour vérifier le document du permis de conduire de l'applicant
        const drivingLicenseCheck = await onfido.check.create({
            applicantId: applicant_id, // Remplacez 'APPLICANT_ID' par l'ID de l'applicant si nécessaire
            applicantProvidesData: false, // Indique que l'applicant fournit les données
            side: 'front',
            documentType: 'driving_licence',
            file: imagePath, // Utilisez le chemin complet de l'image du permis de conduire
            fileName: "d0UuJ3ZrFPU0S3Pfs-ptBYr0.jpg", // Utilisez le nom de l'image du permis de conduire
            reportNames: ["identity_enhanced"],
            
            // Données supplémentaires
            drivingLicenseExpirationDate: "2024-12-31", 
            applicantEmail: "miller@example.com", 
            applicantPhoneNumber: "+1234567890", 
            drivingLicenseCountry: "FR", 
            drivingLicenseNumber: "1234567890" 
            
        });

        // Envoyez la réponse avec le résultat de la vérification
        res.status(200).json(drivingLicenseCheck);
    } catch (error) {
        console.error("Erreur lors de la vérification du permis de conduire de l'applicant :", error);
        res.status(500).json({ error: "Erreur lors de la vérification du permis de conduire de l'applicant" });
    }
}

async function verifyDrivingLicense01(newUser) {
    try {
        const { applicant_id } = req.body;

        // Construire le chemin complet de l'image
        const imagePath = path.join(__dirname, '../../../uploads/users/images/', "d0UuJ3ZrFPU0S3Pfs-ptBYr0.jpg");

        // Utilisez l'API Onfido pour vérifier le document du permis de conduire de l'applicant
        const drivingLicenseCheck = await onfido.check.create({
            applicantId: applicant_id, // Remplacez 'APPLICANT_ID' par l'ID de l'applicant si nécessaire
            applicantProvidesData: false, // Indique que l'applicant fournit les données
            side: 'front',
            documentType: 'driving_licence',
            file: imagePath, // Utilisez le chemin complet de l'image du permis de conduire
            fileName: "d0UuJ3ZrFPU0S3Pfs-ptBYr0.jpg", // Utilisez le nom de l'image du permis de conduire
            reportNames: ["identity_enhanced"],
            
            // Données supplémentaires
            drivingLicenseExpirationDate: "2024-12-31", 
            applicantEmail: "miller@example.com", 
            applicantPhoneNumber: "+1234567890", 
            drivingLicenseCountry: "FR", 
            drivingLicenseNumber: "1234567890" 
            
        });

        // Envoyez la réponse avec le résultat de la vérification
        res.status(200).json(drivingLicenseCheck);
    } catch (error) {
        console.error("Erreur lors de la vérification du permis de conduire de l'applicant :", error);
        res.status(500).json({ error: "Erreur lors de la vérification du permis de conduire de l'applicant" });
    }
}

async function verifyDrivingLicense02(user, drivingLicense, applicant_id, side) {
    try {
        // const { applicant_id } = req.body;

    //     const myPath = `${CONNECTION_PATH}/Backend/uploads/docs/images/${drivingLicense.photo}`;
          const imagePath = `http://localhost:8000/backend/uploads/docs/images/${drivingLicense.photo}`

    //    console.log(MyPath01);

        // Construire le chemin complet de l'image
       // const imagePath = path.join(__dirname, '../../../uploads/docs/images/', drivingLicense.photo);
       // const imagePath = path.join(__dirname, '../../../uploads/docs/images/', drivingLicense.photo);


        console.log(imagePath);
        let isoCountry;

        if (drivingLicense.country === "Canada" || drivingLicense.country === "canada") {
            isoCountry = 'CA';
        }

        if (drivingLicense.country === "United States" || drivingLicense.country === "united states") {
            isoCountry = 'US';
        }

        if (drivingLicense.country === "France" || drivingLicense.country === "france") {
            isoCountry = 'FR';
        }

        // Utilisez l'API Onfido pour vérifier le document du permis de conduire de l'applicant
        const drivingLicenseCheck = await onfido.check.create({
            applicantId: applicant_id, // Remplacez 'APPLICANT_ID' par l'ID de l'applicant si nécessaire
            applicantProvidesData: false, // Indique que l'applicant fournit les données
            side: side,
            documentType: 'driving_licence',
            file: imagePath, // Utilisez le chemin complet de l'image du permis de conduire
            fileName: drivingLicense.photo, // Utilisez le nom de l'image du permis de conduire
            reportNames: ["identity_enhanced"],
            
            // Données supplémentaires
            drivingLicenseExpirationDate: drivingLicense.expires, 
            applicantEmail: user.email, 
            applicantPhoneNumber: user.phone, 
            drivingLicenseCountry: isoCountry, 
            drivingLicenseNumber: drivingLicense.number
            
        });

        // Envoyez la réponse avec le résultat de la vérification
        // res.status(200).json(drivingLicenseCheck);

        if(!drivingLicenseCheck){
            console.log("NON CREATED");
            return { success: false, msg: "Error while crating driving license check"};
        }
        console.log("CREATED");
        return { success: true, msg: "Driver licence is on check", drivingLicenseCheck: drivingLicenseCheck };

    } catch (error) {
        console.error("Erreur lors de la vérification du permis de conduire de l'applicant :", error);
       // res.status(500).json({ error: "Erreur lors de la vérification du permis de conduire de l'applicant" });
    }
}

async function verifyDrivingLicense(user, drivingLicense, applicant_id, side) {
    try {
        let imagePath;
        let userFileName;
        // Construir el camino de la imagen según el lado especificado
        // if (side === "front") {
        //     imagePath = `http://localhost:8000/backend/uploads/docs/images/${drivingLicense.photo.front}`;
        if (side === "front") {
            console.log('sending front DL side...');
            imagePath = `http://localhost:8000/backend/uploads/docs/images/${drivingLicense.photo}`;
            userFileName = drivingLicense.photo;
        } else if (side === "back") {
            console.log('sending back DL side...');
            imagePath = `http://localhost:8000/backend/uploads/docs/images/${drivingLicense.photo.back}`;
        } else if (side === "selfie") {
            console.log('sending back selfie...');
            imagePath = `http://localhost:8000/backend/uploads/docs/images/${user.selfie}`;
            userFileName = drivingLicense.selfie;
        } else {
      
            return { success: false, msg: "Côté invalide du permis de conduire", sideFailded: side};
        }

        let isoCountry;

        if (drivingLicense.country === "Canada" || drivingLicense.country === "canada") {
            isoCountry = 'CA';
        }
        if (drivingLicense.country === "United States" || drivingLicense.country === "united states") {
            isoCountry = 'US';
        }
        if (drivingLicense.country === "France" || drivingLicense.country === "france") {
            isoCountry = 'FR';
        }

        // Utilisez l'API Onfido pour vérifier le document du permis de conduire de l'applicant
        const drivingLicenseCheck = await onfido.check.create({
            applicantId: applicant_id,
            applicantProvidesData: false,
            side: side,
            documentType: 'driving_licence',
            file: imagePath,
            // fileName: drivingLicense[side],
            fileName: userFileName,
            reportNames: ["identity_enhanced"],
            // Données supplémentaires
            drivingLicenseExpirationDate: drivingLicense.expires,
            applicantEmail: user.email,
            applicantPhoneNumber: user.phone,
            drivingLicenseCountry: isoCountry,
            drivingLicenseNumber: drivingLicense.number
        });

        if(!drivingLicenseCheck){
            return { success: false, msg: "Error while crating driving license check", sideFailded: side};
        }

        return { success: true, msg: "Driver licence is on check", drivingLicenseCheck: drivingLicenseCheck };

    } catch (error) {
        console.error("Error durante la verificación del permiso de conducir:", error);
        throw error;
    }
}


/**
 * cette route reçoit des notifications directes des nouveaux événements de la part d'Onfido
 * @param {Object} req L'objet de requête HTTP
 * @param {Object} res L'objet de réponse HTTP
 * @returns {Promise<Object>} Retourne un objet contenant le résultat de la vérification
 */
async function webHooks(req,res){

}


module.exports = {
    createApplicant,
    getApplicantByEmail,
    deleteApplicantByEmail,
    getAllApplicants,
    verifyDrivingLicense
};