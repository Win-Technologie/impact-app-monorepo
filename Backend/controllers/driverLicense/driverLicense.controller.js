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


async function UploadDriverLicense(req, res) {
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

        // Validation des champs de la requête
        await validateLicenseData(req);
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            // deleteUploadedFiles(req.files);
            return res.status(400).json({ errors: validationErrors.array() });
        }

        let myUser = await userCollection.findOne({ _id: myToken.user_id });

        if (!myUser) {
            // deleteUploadedFiles(req.files);
            return res.status(402).json({ msg: "Cet utilisateur n'existe pas" });
        }

    //    // restriction, do not allow double licenses
    //     if (myUser.driverLicense != 'pending') {
    //         // deleteUploadedFiles(req.files);
    //         return res.status(402).json({ msg: "l'utilisateur possède déjà un permis de conduire enregistré" });
    //     }

        if (myUser.name === 'pending' || myUser.lastName === 'pending') {
            // deleteUploadedFiles(req.files);
            return res.status(402).json({ msg: "Veuillez saisir d'abord le nom et le prénom de l'utilisateur" });
        }

        const { number, name, lastName, birthdate, address, appartment, province,
            postalCode, licenseClass, sex, rest, mention, referenceNumber, height,
            weight, issued, expires, city, country, photoRecto, photoVerso, photoSelfie
        } = req.body;

        let licenseExisting = await drivingLicensesCollection.findOne({ number: number });

        // if (licenseExisting) {
        //     return res.status(400).json({ msg: "La licence existe déjà" });
        // }



        let myBirthdate
        // Recuperer les dates de delivrance et d'expiration et les transformer en objets Date
        if (birthdate) {
            myBirthdate = new Date(birthdate);
        }

        const issuedDate = new Date(issued);
        const expirationDate = new Date(expires);

        const newDriverLicense = new DriverLicense({
            user: myToken.user_id,
            number: number,
            name: myUser.name,
            lastName: myUser.lastName,
            // birthdate: birthdate ? formattedBirthdateDate : myUser.birthdate,
            birthdate: birthdate ? myBirthdate : myUser.birthdate,
            address: address,
            appartment: appartment,
            province: province,
            postalCode: postalCode,
            licenseClass: licenseClass,
            sex: sex.toUpperCase(),
            rest: rest,
            mention: mention,
            height: height,
            weight: weight,
            // issued: formattedIssuedDate,
            // expires: formattedExpiresDate,
            issued: issuedDate,
            expires: expirationDate,
            city: city,
            country: country,
            // photo: photoPath,
            photoRecto: photoRecto,
            photoVerso: photoVerso,
            photoSelfie: photoSelfie
        });

        // console.log(newDriverLicense);

        const { veriffResp, body } = await instanceVeriffSession(newDriverLicense);
        // console.log(veriffResp);

        if (!veriffResp) {
            return res.status(400).json({ msg: "Erreur lors de la création d'une session utilisateur veriff" })
        }

        const [updateUser, insertResult] = await Promise.all([
            userCollection.updateOne(
                { _id: myToken.user_id },
                {
                    $set: {
                        driverLicense: newDriverLicense._id,
                        sessionId: body.verification.id,
                        verifLink: body.verification.url,
                        verifStatus: body.verification.status,
                    }
                }
            ),

            drivingLicensesCollection.insertOne(newDriverLicense)

        ]);

        if (!insertResult || !updateUser) {
            return res.status(500).json({ msg: "Erreur d'insertion de la nouvelle licence" });
        }
 
        //Télécharger des photos d'identité dans le profil veriff de l'utilisateur à des fins d'authentification.
        const resultUploadeImages = await uploadAllImagesToVeriff(body.verification.id, photoRecto, photoVerso, photoSelfie, myUser);
        console.log('resultUploadeImages : ', resultUploadeImages);


        const cacheKeyDriverL = newDriverLicense._id;
        myCache.set(cacheKeyDriverL, newDriverLicense);

    

        res.status(201).json({
            msg: 'Nouvelle licence ajoutée avec succès',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "UPLOAD DL :Erreur interne du serveur", error: error });
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


module.exports = {

    UploadDriverLicense,
    GetMyLicense,
    GetDrivingLicense,
    DeleteDrivingLicense
}