// // Importations nécessaires
const { getDb } = require('../../mongoConnection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('../../utils/jwt');
// VALIDATE INFOS
const { body, validationResult } = require('express-validator');
// FILES MANAGEMENT
const { deleteUploadedFiles, checkFileSize,
    checkFileQuantity, getFilePath, getFileName,
    processDocument, processLicenseText, processInsuranceText } = require('../../utils/files');
// CODES GENERATOR
const { generateVerificationCode } = require('../../utils/generatorcodes');
// NODE MAILER
const { sendVerificationEmail } = require('../../utils/nodemailer');


// CACHE
const { myCache, encryptData, decryptData } = require("../../utils/cache");

// CRYPTO
const { encryptDataAES, decryptDataAES } = require('../../utils/encryptdata');


// const { instanceVeriffSession } = require('../../controllers/veriff/veriff.controller');
const { instanceVeriffSession,  uploadAllImagesToVeriff } = require('../../utils/veriff');

// QR Code Generator
const qr = require('qrcode');
const jsQR = require('jsqr');


// MODELS
const User = require('../../modeles/users/user');
const DriverLicense = require('../../modeles/driver_license/driverLicense');
const { uploadCollectedData } = require('../../utils/veriff');
// VARIABLES
const AES_KEY = process.env.AES_KEY
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const DRIVERLICENSECOLLECTION = process.env.DRIVERSLICENSECOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;

const SECRETKEY_IDQR = process.env.SECRETKEY_IDQR;

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const drivingLicensesCollection = mainDb.collection(DRIVERLICENSECOLLECTION);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

// verify driver license info from request
async function validateLicenseData(req) {

    await Promise.all([
        body('number').isLength({ min: 8 }).withMessage('Le numéro de licence doit contenir au moins 8 caractères').run(req),
        body('name').optional().isLength({ min: 3 }).withMessage('Le prénom doit contenir au moins 3 caractères').run(req),
        body('lastName').optional().isLength({ min: 3 }).withMessage('Le nom de famille doit contenir au moins 3 caractères').run(req),
        body('birthdate').optional().isString().matches(/^\d{4}\/\d{2}\/\d{2}$/).withMessage('La date de naissance doit être au format yyyy/mm/dd').run(req),
        body('address').optional().isLength({ min: 4 }).withMessage('L\'adresse doit contenir au moins 4 caractères').run(req),
        body('appartment').optional().isLength({ min: 2 }).withMessage('L\'appartement doit contenir au moins deux caractères').run(req),
        body('province').optional().isLength({ min: 2 }).withMessage('La province doit contenir au moins deux caractères').run(req),
        body('postalCode').optional().isLength({ min: 4 }).withMessage('Le code postal doit contenir au moins 4 caractères').run(req),
        body('licenseClass').isLength({ min: 1 }).withMessage('La classe de licence doit contenir au moins 1 caractère').run(req),
        // body('sex').isLength({ min: 1 }).withMessage('Le sexe doit contenir au moins 1 caractère').run(req),
        body('sex').optional()
            .isLength({ min: 1 }).withMessage('Le sexe doit contenir au moins 1 caractère')
            .custom((value) => {
                if (!['m', 'f'].includes(value)) {
                    throw new Error('Le sexe doit être "m" ou "f"');
                }
                return true;
            })
            .run(req),
        body('rest').optional().isLength({ min: 2 }).withMessage('Le champ "rest" doit contenir au moins 2 caractères').run(req),
        body('mention').optional().isLength({ min: 2 }).withMessage('Le champ "mention" doit contenir au moins 2 caractères').run(req),
        body('referenceNumber').optional().optional().isLength({ min: 4 }).withMessage('Le numéro de référence doit contenir au moins 4 caractères').run(req),
        body('height').optional().isLength({ min: 2 }).withMessage('La hauteur doit contenir au moins 2 caractères').run(req),
        body('weight').optional().isLength({ min: 2 }).withMessage('Le poids doit contenir au moins 2 caractères').run(req),
        body('issued').isString().matches(/^\d{4}\/\d{2}\/\d{2}$/).withMessage('La date d\'émission doit être au format yyyy/mm/dd').run(req),
        // body('expires').isString().matches(/^\d{4}\/\d{2}\/\d{2}$/).withMessage('La date d\'expiration doit être au format yyyy/mm/dd').run(req),

        body('expires')
            .isString().matches(/^\d{4}\/\d{2}\/\d{2}$/).withMessage('La date d\'expiration doit être au format yyyy/mm/dd')
            .custom((value, { req }) => {
                const expirationDate = new Date(value);
                const currentDate = new Date();
                if (expirationDate <= currentDate) {
                    throw new Error("La date d'expiration est déjà passée ou expire aujourd'hui");
                }

                return true;
            }).run(req),

        body('city').optional().isString().isLength({ min: 4 }).withMessage('La ville doit contenir au moins 4 caractères').run(req),
        body('country').optional().isString().isLength({ min: 4 }).withMessage('Le pays doit contenir au moins 4 caractères').run(req),
        body('photoRecto').notEmpty().isString().withMessage('La photo <<recto>> droite est obligatoire et doit être une chaîne de caractères').run(req),
        body('photoVerso').notEmpty().isString().withMessage('La photo <<verso>> droite est obligatoire et doit être une chaîne de caractères').run(req),
        body('photoSelfie').notEmpty().isString().withMessage('La photo <<selfie>> droite est obligatoire et doit être une chaîne de caractères').run(req),
        //  photoRecto, photoVerso, photoSelfie
  
    ]);
}

async function validateUpdateLicenseData(req){
    try {
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "GET DL : Erreur de serveur interne", error: error });
    }
}



async function GetMyLicense(req,res){
    try {

        // Récupérer le jeton du header de la requête
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            console.error('Le Token n\'est pas fourni');  
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
           
            return res.status(400).json({ msg: "Token invalide" });
        }

        const myLicense = await drivingLicensesCollection.findOne({ user: myToken.user_id });

        if(!myLicense){
            return res.status(404).json({msg: "Aucune licence n'a été trouvée"});
        }

        res.status(200).json(myLicense);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "GET DL : Erreur de serveur interne", error: error });
    }
}

async function GetDrivingLicense(req, res) {
    try {
        // Récupérer le jeton du header de la requête
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            console.error('Le Token n\'est pas fourni');
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
    
            return res.status(400).json({ msg: "Token invalide" });
        }

        const { licenseId } = req.body;

        const myLicense = await drivingLicensesCollection.findOne({ _id: licenseId});

        if(!myLicense){
            return res.status(404).json({msg: "Aucune licence n'a été trouvée"});
        }

        res.status(200).json(myLicense);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "GET DL : Erreur de serveur interne", error: error });
    }
}

async function UpdateDrivingLicense(req, res) {
    try {

        res.status(200).json({ msg: "Hello from UpdateDrivingLicense" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "UPDATE DL : Erreur de serveur interne", error: error });
    }
}

async function DeleteDrivingLicense(req, res) {
    try {
        let responseSent = false; // Variable pour contrôler si une réponse a été envoyée

        // Récupérer le jeton du header de la requête
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            console.error('Le Token n\'est pas fourni');
            responseSent = true;
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
            responseSent = true;
            return res.status(400).json({ msg: "Token invalide" });
        }

        const { licenseId } = req.body;

        // Recherche de la licence à supprimer
        const findLicensePromise = drivingLicensesCollection.findOne({ _id: licenseId })
            // Une fois la licence trouvée, cette fonction est appelée pour traiter le résultat
            .then(myLicense => {
                // Vérifier si la licence a été trouvée
                if (!myLicense) {
                    responseSent = true;
                    return res.status(404).json({ msg: "Aucune licence n'a été trouvée" });
                }
                // Renvoyer l'ID de l'utilisateur associé à la licence
                return myLicense.user;
            });

        // Suppression de la licence
        const deleteLicensePromise = drivingLicensesCollection.deleteOne({ _id: licenseId });

        // Exécution des promesses en parallèle
        const [userId, deleteResult] = await Promise.all([findLicensePromise, deleteLicensePromise]);

        // Vérification du résultat de la suppression et envoi de la réponse appropriée
        if (!responseSent && deleteResult.deletedCount > 0) {
            // Modification du champ driverLicense de l'utilisateur correspondant à "pending"
            await userCollection.updateOne(
                { _id: userId },
                { $set: { driverLicense: "pending" } }
            );
            return res.status(200).json({ msg: "Licence de conduire supprimée avec succès" });
        } else if (!responseSent) {
            return res.status(400).json({ msg: "La licence n'a pas pu être effacée" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "DELETE DL : Erreur de serveur interne", error: error });
    }
}


/**
 * Crée un nouveau permis de conduire pour l'utilisateur authentifié.
 * Cette fonction traite une requête HTTP pour créer un permis de conduire en utilisant les informations fournies dans le corps de la requête. 
 * Elle commence par extraire les données nécessaires, vérifie l'authentification de l'utilisateur à l'aide d'un jeton JWT, puis récupère les informations de l'utilisateur 
 * depuis la base de données. Ensuite, elle crée une nouvelle instance de permis de conduire avec les données fournies et les informations de l'utilisateur, 
 * avant de sauvegarder cette instance dans la base de données. Enfin, elle renvoie une réponse JSON indiquant le succès ou l'échec de l'opération.
 * 
 * @param {*} req Requête HTTP contenant les données du permis de conduire dans req.body.
 * @param {*} res Réponse HTTP pour renvoyer le résultat de l'opération.
 * @returns Réponse JSON indiquant le succès ou l'échec de la création du permis de conduire.
 */
const createDrivingLicence = async (req, res) => {
    try {
        // Récupération des données du permis de conduire depuis le corps de la requête
        const { number, licenseClass, mention, issued, expires } = req.body;

        // Extraction du jeton d'authentification depuis les en-têtes HTTP
        const token = req.headers.authorization?.replace("Bearer ", "");

        // Vérifier si le jeton est présent
        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        // Récupérer l'identifiant de l'utilisateur à partir du token JWT
        const userId = myToken.user_id;

        // Rechercher l'utilisateur dans la base de données
        const loggedInUser = await userCollection.findOne({ "_id": userId });
        if (!loggedInUser) {
            return res.status(403).json({ msg: "Utilisateur non trouvé" });
        }

        // Récupérer les champs essentiels de l'utilisateur pour le permis de conduire
        const { name, lastName, birthdate, address, postalCode, city, province, country, gender } = loggedInUser;

        // Création d'une nouvelle instance de DriverLicense
        const newDriverLicense = new DriverLicense({
            user: userId,
            name,
            lastName,
            birthdate,
            sex: gender,
            address,
            postalCode,
            city,
            province,
            country,
            number,
            licenseClass,
            mention,
            issued,
            expires
        });

        // Sauvegarder le permis de conduire dans la collection spécifiée
        await drivingLicensesCollection.insertOne(newDriverLicense);

        // Répondre avec un message JSON indiquant le succès de la création du permis de conduire
        return res.status(201).json({ msg: "Permis de conduire créé avec succès", driverLicense: newDriverLicense });

    } catch (error) {
        console.error(error);
        // En cas d'erreur, renvoyer une réponse d'erreur interne du serveur
        return res.status(500).json({ msg: "Erreur serveur" });
    }
};


module.exports = {

    createDrivingLicence,
    GetMyLicense,
    GetDrivingLicense,
    DeleteDrivingLicense
}