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
// ONFIDO
// const { createApplicant, verifyDocuments } = require('../onfido/onfido.controller');
const { createApplicant, verifyDrivingLicense } = require('../onfido/onfido.controller');

// CACHE
const { myCache, encryptData, decryptData } = require("../../utils/cache");

// CRYPTO
const { encryptDataAES, decryptDataAES } = require('../../utils/encryptdata');

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
        body('country').optional().isString().isLength({ min: 4 }).withMessage('Le pays doit contenir au moins 4 caractères').run(req)
    ]);
}

async function UploadDriverLicense(req, res) {
    try {

        // const documentFile = req.files.document;

        // Récupérer le jeton du header de la requête
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            console.error('Le Token n\'est pas fourni');
            deleteUploadedFiles(req.files);
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
            deleteUploadedFiles(req.files);
            return res.status(400).json({ msg: "Token invalide" });
        }

        // Validation des champs de la requête
        await validateLicenseData(req);
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            deleteUploadedFiles(req.files);
            return res.status(400).json({ errors: validationErrors.array() });
        }



        let myUser = await userCollection.findOne({ _id: myToken.user_id });


        if (!myUser) {
            deleteUploadedFiles(req.files);
            return res.status(402).json({ msg: "Cet utilisateur n'existe pas" });
        }

        // restriction, do not allow double licenses
        if (myUser.driverLicense != 'pending') {
            deleteUploadedFiles(req.files);
            return res.status(402).json({ msg: "l'utilisateur possède déjà un permis de conduire enregistré" });
        }


        if (myUser.name === 'pending' || myUser.lastName === 'pending') {
            deleteUploadedFiles(req.files);
            return res.status(402).json({ msg: "Veuillez saisir d'abord le nom et le prénom de l'utilisateur" });
        }


        // if (!documentFile) {
        //     return res.status(400).json({ msg: "Vous devez présenter un permis de conduire valide et une photo" });
        // }

        if (!req.files) {
            return res.status(400).json({ msg: "Vous devez présenter un permis de conduire valide et une photo" });
        }



        const { number, name, lastName, birthdate, address, appartment, province,
            postalCode, licenseClass, sex, rest, mention, referenceNumber, height,
            weight, issued, expires, city, country
        } = req.body;


        let licenseExisting = await drivingLicensesCollection.findOne({ number: number });

        if (licenseExisting) {
            return res.status(400).json({ msg: "La licence existe déjà" });
        }

        let photoPath;

        if (req.files && Object.keys(req.files).length > 0) {


            // Vérifier que les fichiers respectent la taille maximale autorisée.
            const { isValid: isSizeValid, fileName: oversizedFileName } = checkFileSize(req.files);

            // Vérifier que le nombre de fichiers ne dépasse pas la limite autorisée.
            const maxFileQuantity = 1; // Définit le nombre maximum de fichiers autorisés.
            const { isValid: isQuantityValid } = checkFileQuantity(req.files, maxFileQuantity);

            // Si la taille des fichiers n'est pas valide
            if (!isSizeValid) {
                // Supprimer tous les fichiers téléchargés dans le système de fichiers
                deleteUploadedFiles(req.files);
                return res.status(400).json({ msg: `La taille du fichier ${oversizedFileName} doit être inférieure à 500KB` });
            }

            // Si la quantité de fichiers n'est pas valide
            if (!isQuantityValid) {
                // Supprimer tous les fichiers téléchargés dans le système de fichiers
                deleteUploadedFiles(req.files);
                return res.status(400).json({ msg: `Le nombre de fichiers ne peut pas dépasser ${maxFileQuantity}` });
            }

            photoPath = getFileName(req.files[`photo`]);



        }

        let formattedBirthdateDate;

        if (birthdate) {
            // const birthdateDate = new Date(birthdate);
            // formattedBirthdateDate = birthdateDate.toISOString().split('T')[0];
            const issuedArray = birthdate.split('-');
            formattedBirthdateDate = `${issuedArray[0]}`;
        }

        // const issuedDate = new Date(issued);
        // const formattedIssuedDate = issuedDate.toISOString().split('T')[0];

        // const expiresDate = new Date(expires);
        // const formattedExpiresDate = expiresDate.toISOString().split('T')[0];

        const issuedArray = issued.split('-');
        const formattedIssuedDate = `${issuedArray[0]}`;

        const expiresArray = expires.split('-');
        const formattedExpiresDate = `${expiresArray[0]}`;

        //.toLowerCase(),
        // const newDriverLicense = new DriverLicense({
        //     user: myToken.user_id,
        //     number: number,
        //     name: name,
        //     lastName: lastName,
        //     birthdate: formattedBirthdateDate,
        //     address: address,
        //     appartment: appartment,
        //     province: province,
        //     postalCode: postalCode,
        //     licenseClass: licenseClass,
        //     sex: sex,
        //     rest: rest,
        //     mention: mention,
        //     height: height,
        //     weight: weight,
        //     issued: formattedIssuedDate,
        //     expires: formattedExpiresDate,
        //     city: city,
        //     country: country,
        //     photo: photoPath,
        // });

        const newDriverLicense = new DriverLicense({
            user: myToken.user_id,
            number: number,
            name: myUser.name,
            lastName: myUser.lastName,
            birthdate: birthdate ? formattedBirthdateDate : myUser.birthdate,
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
            issued: formattedIssuedDate,
            expires: formattedExpiresDate,
            city: city,
            country: country,
            photo: photoPath,
        });

        const [updateUser, insertResult] = await Promise.all([
            userCollection.updateOne(
                { _id: myToken.user_id },
                { $set: { driverLicense: newDriverLicense._id } }
            ),
            drivingLicensesCollection.insertOne(newDriverLicense)
        ]);

        if (!insertResult || !updateUser) {
            return res.status(500).json({ msg: "Erreur d'insertion de la nouvelle licence" });
        }

        // // Création de l'applicant dans Onfido
        // const applicantResult = await createApplicant(myUser, newDriverLicense);
        // console.log(applicantResult);

        // // Vérification du résultat de la création de l'applicant dans Onfido
        // if (!applicantResult.success) {
        //     return res.status(400).json({ msg: applicantResult.msg });
        // }

        // // veriication du permis de conduire 
        // applicantResult.applicantId
        // const fronDriverLicensecheck = await verifyDrivingLicense(
        //     myUser,
        //     newDriverLicense,
        //     applicantResult.applicantId,
        //     "front"
        // );

        // const backDriverLicense = await verifyDrivingLicense(
        //     myUser,
        //     newDriverLicense,
        //     applicantResult.applicantId,
        //     "back"
        // );

        // const userSelfie = await verifyDrivingLicense(
        //     myUser,
        //     newDriverLicense,
        //     applicantResult.applicantId,
        //     "selfie"
        // );

        // if (!fronDriverLicensecheck.success) {
        //     return res.status(400).json({ msg: fronDriverLicensecheck.msg })
        // }

        // if (!fronDriverLicensecheck.success) {
        //     return res.status(400).json({
        //         frontCheck: fronDriverLicensecheck.msg,
        //         backCheck: backDriverLicense.msg,
        //         selfieCheck: userSelfie.msg,
        //     });
        // }

        res.status(201).json({
            msg: 'Nouvelle licence ajoutée avec succès',
            // applicandID: applicantResult.applicantId,
            // fronDriverLicensecheck: fronDriverLicensecheck,
            // userSelfieCheck: userSelfie
        });


    } catch (error) {
        console.error(`UploadDriverLicense: Erreur interne du serveur : ${error.message}, ${error}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}


module.exports ={

    uploadCollectedData
}