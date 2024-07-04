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

const { generatePDF } = require('../../utils/pdfUtils');
const { sendAccidentReportByEmail } = require('../../utils/nodemailer');
    

// CACHE
const { myCache, encryptData, decryptData } = require("../../utils/cache");

// MODELS
const Accident = require('../../modeles/accidentReport/accidentReport');
const User = require('../../modeles/users/user');
const DriverLicense = require('../../modeles/driver_license/driverLicense');

const { getUserInfo } = require('../../controllers/user/user.controller');

// getMyAutoFullInfo from user controller
const { getMyAutoFullInfo } = require('../user/user.controller');

// VARIABLES
const AES_KEY = process.env.AES_KEY
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const DRIVERLICENSECOLLECTION = process.env.DRIVERSLICENSECOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;
const ACCIDENTREPORTS_COLLECTION = process.env.ACCIDENTREPORTSCOLLECTION;
const USER_ROUTER_IMG_ACCIDENT_REPPORT_PATH = process.env.USER_ROUTER_IMG_ACCIDENT_REPPORT_PATH;

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const drivingLicensesCollection = mainDb.collection(DRIVERLICENSECOLLECTION);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);
const accidentReportCollection = mainDb.collection(ACCIDENTREPORTS_COLLECTION);

const path = require('path');
const fs = require('fs');

async function validateAccidentReport(req) {
    await Promise.all([
        // Validate owner details
        body('owner.name').isString().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long').run(req),
        body('owner.lastName').isString().isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long').run(req),
        body('owner.email').isEmail().withMessage('Invalid email address').run(req),
        body('owner.phone').isString().isLength({ min: 3 }).withMessage('Phone must be at least 3 characters long').run(req),
        body('owner.address').isString().isLength({ min: 3 }).withMessage('Address must be at least 3 characters long').run(req),
        body('owner.postalCode').isString().isLength({ min: 3 }).withMessage('Postal code must be at least 3 characters long').run(req),
        body('owner.city').isString().isLength({ min: 3 }).withMessage('City must be at least 3 characters long').run(req),
        body('owner.province').isString().isLength({ min: 2 }).withMessage('Province must be at least 2 characters long').run(req),
        body('owner.country').isString().isLength({ min: 3 }).withMessage('Country must be at least 3 characters long').run(req),

        // Validate vehicle details
        body('vehicle._id').isString().withMessage('Vehicle ID must be a string').run(req),
        body('vehicle.brand').isString().isLength({ min: 3 }).withMessage('Vehicle brand must be at least 3 characters long').run(req),
        body('vehicle.model').isString().isLength({ min: 3 }).withMessage('Vehicle model must be at least 3 characters long').run(req),
        body('vehicle.year').isInt({ min: 1886 }).withMessage('Vehicle year must be a valid year').run(req),
        body('vehicle.color').isString().isLength({ min: 3 }).withMessage('Vehicle color must be at least 3 characters long').run(req),
        body('vehicle.plate').isString().isLength({ min: 3 }).withMessage('Vehicle plate must be at least 3 characters long').run(req),
        body('vehicle.serialNumber').isString().isLength({ min: 3 }).withMessage('Vehicle serial number must be at least 3 characters long').run(req),
        body('vehicle.owner').isString().isLength({ min: 3 }).withMessage('Vehicle owner must be at least 3 characters long').run(req),
        body('vehicle.documents').isArray().withMessage('Vehicle documents must be an array').run(req),
        body('vehicle.isActive').isBoolean().withMessage('Vehicle isActive must be a boolean').run(req),
        body('vehicle.dateAdded').isISO8601().toDate().withMessage('Invalid date added').run(req),

        // Validate vehicle immatriculation details
        body('vehicle.immatriculation.numeroCertificatImmatriculation').isString().isLength({ min: 3 }).withMessage('Certificate number must be at least 3 characters long').run(req),
        // body('vehicle.immatriculation.dateDelivrance').isISO8601().toDate().withMessage('Invalid delivery date').run(req),
        // body('vehicle.immatriculation.dateExpiration').isISO8601().toDate().withMessage('Invalid expiration date').run(req),
        body('vehicle.immatriculation.numeroEssieux').isInt({ min: 1 }).withMessage('Number of axles must be a positive integer').run(req),
        body('vehicle.immatriculation.masseNette').isInt({ min: 1 }).withMessage('Net weight must be a positive integer').run(req),
        body('vehicle.immatriculation.cylindree').isInt({ min: 1 }).withMessage('Engine displacement must be a positive integer').run(req),
        body('vehicle.immatriculation.numeroDossier').isString().isLength({ min: 3 }).withMessage('Dossier number must be at least 3 characters long').run(req),
        body('vehicle.immatriculation.categorieUsage').isString().isLength({ min: 3 }).withMessage('Usage category must be at least 3 characters long').run(req),

        // Validate driver license details
        body('driverLicense.number').isString().isLength({ min: 8 }).withMessage('License number must be at least 8 characters long').run(req),
        body('driverLicense.name').isString().isLength({ min: 3 }).withMessage('Driver name must be at least 3 characters long').run(req),
        body('driverLicense.lastName').isString().isLength({ min: 3 }).withMessage('Driver last name must be at least 3 characters long').run(req),
        body('driverLicense.birthdate').isISO8601().withMessage('Invalid birthdate').run(req),
        body('driverLicense.address').isString().isLength({ min: 3 }).withMessage('Driver address must be at least 3 characters long').run(req),
        body('driverLicense.appartment').optional().isString().isLength({ min: 2 }).withMessage('Apartment must be at least 2 characters long').run(req),
        body('driverLicense.country').isString().isLength({ min: 3 }).withMessage('Country must be at least 3 characters long').run(req),
        body('driverLicense.province').isString().isLength({ min: 2 }).withMessage('Province must be at least 2 characters long').run(req),
        body('driverLicense.postalCode').isString().isLength({ min: 4 }).withMessage('Postal code must be at least 4 characters long').run(req),
        body('driverLicense.licenseClass').isString().isLength({ min: 1 }).withMessage('License class must be at least 1 character long').run(req),
        body('driverLicense.sex').isString().isLength({ min: 1 }).withMessage('Sex must be at least 1 character long').custom(value => ['M', 'F'].includes(value)).withMessage('Sex must be "M" or "F"').run(req),
        body('driverLicense.rest').optional().isString().isLength({ min: 2 }).withMessage('Rest must be at least 2 characters long').run(req),
        body('driverLicense.mention').optional().isString().isLength({ min: 2 }).withMessage('Mention must be at least 2 characters long').run(req),
        body('driverLicense.height').optional().isString().isLength({ min: 2 }).withMessage('Height must be at least 2 characters long').run(req),
        body('driverLicense.weight').optional().isString().isLength({ min: 2 }).withMessage('Weight must be at least 2 characters long').run(req),
        body('driverLicense.issued').isISO8601().toDate().withMessage('Invalid issuance date').run(req),
        body('driverLicense.expires').isISO8601().toDate().withMessage('Invalid expiration date').custom((value, { req }) => {
            const expirationDate = new Date(value);
            const currentDate = new Date();
            if (expirationDate < currentDate) {
                throw new Error("Expiration date has already passed or is today");
            }
            return true;
        }).run(req),
        body('driverLicense.city').isString().isLength({ min: 3 }).withMessage('City must be at least 3 characters long').run(req),
        body('driverLicense.country').isString().isLength({ min: 3 }).withMessage('Country must be at least 3 characters long').run(req),

        // Validate insurance details (assuming insurance is an object with certain fields)
        body('insurance').optional().isObject().withMessage('Insurance must be an object').custom(insurance => {
            if (insurance) {
                return [
                    body('insurance.provider').isString().isLength({ min: 3 }).withMessage('Provider must be at least 3 characters long').run(req),
                    body('insurance.policyNumber').isString().isLength({ min: 3 }).withMessage('Policy number must be at least 3 characters long').run(req),
                    body('insurance.effectiveDate').isISO8601().toDate().withMessage('Invalid effective date').run(req),
                    body('insurance.expirationDate').isISO8601().toDate().withMessage('Invalid expiration date').run(req)
                ];
            }
            return true;
        }).run(req)
    ]);
}



/**
 * Crée un nouveau rapport d'accident à partir des données fournies dans la requête HTTP.
 * Vérifie l'authenticité du jeton JWT dans l'en-tête de la requête pour accéder aux données de l'utilisateur.
 * Valide les données d'accident reçues, les transforme au besoin, puis les enregistre dans la base de données.
 * 
 * @param {*} req - Requête HTTP contenant les données du rapport d'accident dans req.body.
 * @param {*} res - Réponse HTTP pour retourner le résultat de l'opération.
 * @returns {Object} Réponse JSON indiquant le succès ou l'échec de la création du rapport.
 */
async function newAccidentReport(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        
        // Vérifier si le jeton est présent
        if (!token) {
            console.error('Le Token n\'est pas fourni');
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Correction du nom de la fonction pour décoder le token JWT
        
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const loggedInUserId = myToken.user_id;

        const accidentDataArray = req.body.accidentDataArray; // On s'attend maintenant à un tableau de données d'accidents

        const { accidentDate, accidentHour } = accidentDataArray[0];

        // Transformation de accidentDate et accidentHour en formats appropriés
        const currentDate = new Date(accidentDate); // Transformer accidentDate en Date
        const [hour, minute] = accidentHour.split('h'); // Diviser accidentHour en heures et minutes
        const currentTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`; // Utilisation de padStart pour formater l'heure

        const myAccidentLocation = accidentDataArray[0].accidentLocation;

        const _accidentSketch = accidentDataArray[0].accidentSketch || "not provided";
        const _accitendType = accidentDataArray[0].accitendType || "not provided";
        const _vehicleDamageDescription = accidentDataArray[0].vehicleDamageDescription || "not provided";

        // Récupérer les fichiers photos depuis la requête multipart
        const photos = req.files?.photos;

        // Vérifier la présence et la limite de photos
        if (!photos || photos.length < 3 || photos.length > 6) {
            return res.status(400).json({ msg: "Limite de photos : minimum 3 et maximum 6." });
        }

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

        // Mapper les chemins de fichiers téléchargés pour les photos
        const photoPaths = photos.map(photo => {
            const fileExtension = path.extname(photo.name).toLowerCase();
            
            if (!allowedExtensions.includes(fileExtension)) {
                throw new Error(`Le fichier téléchargé n'est pas une image valide.`);
            }
            
            // Générer un nom de fichier unique pour éviter les conflits
            const uniqueFileName = `${loggedInUserId}_${Date.now()}${fileExtension}`;
            const filePath = path.join(USER_ROUTER_IMG_ACCIDENT_REPPORT_PATH, uniqueFileName);

            // Déplacer le fichier téléchargé vers le dossier spécifié
            fs.renameSync(photo.path, filePath);

            // Retourner le chemin relatif du fichier
            return filePath;
        });

        // Mapper les rapports de véhicules pour chaque accident
        const vehicleReports = accidentDataArray.map(accidentData => {
            const { owner, vehicle, insurance, driverLicense } = accidentData;

            const issuedDateFormat = new Date(driverLicense.issued);
            const expiresDateFormat = new Date(driverLicense.expires);
            const dateDelivranceFormat = new Date(vehicle.immatriculation.dateDelivrance);
            const dateStartInsuranceFormat = new Date(insurance.startDate);

            return {
                user: myToken.user_id,
                personalDetails: {
                    profileImagePath: owner.profileImagePath,
                    name: owner.name,
                    lastName: owner.lastName,
                    address: owner.address,
                    phone: owner.phone,
                    postalCode: owner.postalCode,
                    email: owner.email,
                    city: owner.city,
                    province: owner.province,
                    country: owner.country,
                    profileImagePath: owner.profileImagePath
                },
                drivingLicense: {
                    number: driverLicense.number,
                    issuanceDate: issuedDateFormat,
                    licenseClass: driverLicense.licenseClass,
                    expirationDate: expiresDateFormat,
                    driverLicenseId: driverLicense._id
                },
                vehicleDetails: {
                    registrationCertificate: {
                        fileNumber: vehicle.immatriculation.numeroDossier,
                        vehicleBrand: vehicle.brand,
                        year: vehicle.year,
                        vehicleSerialNumber: vehicle.immatriculation.serialNumber,
                        licensePlateNumber: vehicle.plate,
                        issuanceDate: dateDelivranceFormat,
                        vehicleId: vehicle._id
                    },
                    insuranceCertification: {
                        insuranceCompany: insurance.insuranceCompany,
                        policyNumber: insurance.insuranceNumber,
                        effectiveDate: dateStartInsuranceFormat,
                        insuredName: owner.name,
                        insuredLastName: owner.lastName,
                        assuranceId: insurance._id
                    }
                }
            };
        });

        // Créer un nouveau rapport d'accident
        const newAccidentReport = new Accident({
            accidentDate: currentDate,
            hourAccident: currentTime,
            accidentLocation: myAccidentLocation,
            vehicles: vehicleReports,
            accidentSketch: _accidentSketch,
            accitendType: _accitendType,
            vehicleDamageDescription: _vehicleDamageDescription,
            photos: photoPaths
        });

        // Sauvegarder le rapport d'accident dans la base de données
        await accidentReportCollection.insertOne(newAccidentReport);
        
        // Mettre à jour la collection d'utilisateurs pour inclure le nouveau rapport d'accident
        await userCollection.updateOne(
            { "_id": myToken.user_id },
            { $push: { accidentReports: newAccidentReport._id } }
        );

        const pdfBytes = await generatePDF(newAccidentReport);
        const emails = accidentDataArray.map(data => data.owner.email);
        await sendAccidentReportByEmail(emails, pdfBytes);

        // Retourner un message de succès avec les détails du nouveau rapport d'accident créé
        return res.status(201).json({ msg: "Nouveau rapport d'accident créé avec succès", accidentId: newAccidentReport._id, newAccidentReport });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur lors de la création du rapport d'accident", error: error.message });
    }
}






async function joinToAccidentReport(req, res) {

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

    // "subscriber": "65fc4565e55d51baf95cc907",
    // "vehicle": "663a42e0f730983f95848238",

    const { vehicleId, userId, accidentReportId } = req.body;

    const findAccidentReport = await accidentReportCollection.findOne({ _id: accidentReportId });

    if (!findAccidentReport) {
        return res.status(404).json({ msg: "accident report not found" });
    }


    // const { response, statusCode, msg } = await getUserInfo(myToken.user_id, vehicleId);

    const { response, statusCode, msg } = await getUserInfo(userId, vehicleId);

    if (!response) {
        return res.status(statusCode).json({ msg });
    }

    const { owner, vehicle, insurance, driverLicense } = response;

    // const vehicleData = instanceVehicleData(owner, vehicle, insurance, driverLicense, myToken.user_id);
    const vehicleData = instanceVehicleData(owner, vehicle, insurance, driverLicense, userId);

    // console.log(vehicleData);

    // await accidentReportCollection.updateOne(
    //     { "_id": accidentReportId },
    //     { $set: { vehicleB: vehicleData } }
    // );
    await accidentReportCollection.updateOne(
        { "_id": accidentReportId },
        { $push: { vehicles: vehicleData } }
    );

    // await userCollection.updateOne(
    //     { "_id": userId },
    //     { $push: { accidentReports: findAccidentReport._id } }
    // );

    // return res.status(statusCode).json({msg: "Connection to accident report OK", No: "v02" });
    return res.status(statusCode).json({ msg: "Connection to accident report OK" });
}




function instanceVehicleData(owner, vehicle, insurance, driverLicense, user_id) {

    const now = new Date();

    const issuedDateFormat = new Date(driverLicense.issued);
    const expiresDateFormat = new Date(driverLicense.expires);
    const dateDelivranceFormat = new Date(vehicle.immatriculation.dateDelivrance);
    const dateStartInsuranceFormat = new Date(insurance.startDate);

    const vehicleData = {
        user: user_id,
        personalDetails: {
            name: owner.name,
            lastName: owner.lastName,
            address: owner.address,
            phone: owner.phone,
            postalCode: owner.postalCode,
            email: owner.email,
            city: owner.city,
            province: owner.province,
            country: owner.country
        },
        drivingLicense: {
            number: driverLicense.number,
            issuanceDate: issuedDateFormat,
            licenseClass: driverLicense.licenseClass,
            expirationDate: expiresDateFormat,
            driverLicenseId: driverLicense._id
        },
        vehicleDetails: {
            registrationCertificate: {
                fileNumber: vehicle.immatriculation.numeroDossier,
                vehicleBrand: vehicle.brand,
                year: vehicle.year,
                vehicleSerialNumber: vehicle.immatriculation.serialNumber,
                licensePlateNumber: vehicle.plate,
                issuanceDate: dateDelivranceFormat,
                vehicleId: vehicle._id
            },
            insuranceCertification: {
                insuranceCompany: insurance.insuranceCompany,
                policyNumber: insurance.insuranceNumber,
                effectiveDate: dateStartInsuranceFormat,
                insuredName: owner.name,
                insuredLastName: owner.lastName,
                assuranceId: insurance._id
            }
        },

    };

    return vehicleData;
}


async function updateAccidentReport(req, res) {
    try {

        const userData = req.body;
        const {accidentId} = req.params;

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

        const id = userData && userData.user_id ? userData.user_id : myToken.user_id;


        // console.log(id);
        // console.log(userData);

        const [foundUser, foundAccidentR] = await Promise.all([
            userCollection.findOne({ _id: id }),
            accidentReportCollection.findOne({ _id: accidentId }),
        ]);

        if (!foundUser) {
            return res.status(404).json({ msg: "Utilisateur non trouvé" });
        }

        if(!foundAccidentR){
            return res.status(404).json({ msg: "Rapport d'accident non trouvé" });
        }

        let myUserData = {};

        if (userData.vehicleNumber === 'v01') {

            if (userData.vehicleDamage) {

                if (userData.vehicleDamage == 'true') {
                    if (!userData.vehicleDamageDescription) {
                        return res.status(400).json({ msg: "Vous devez introduire une description des dommages" });
                    }
                    myUserData.vehicleADamage = true;
                    myUserData.vehicleADamageDescription = userData.vehicleDamageDescription;
                } else {
                    myUserData.vehicleADamage = false;
                    myUserData.vehicleADamageDescription = "Aucun dommage"
                }
            }

            if (userData.injured && userData.injured == 'true') {
                if (!userData.injuredDescription) {
                    return res.status(400).json({ msg: "Vous devez fournir une description des lésions" });
                }
                myUserData.injuredVehicleA = true;
                myUserData.injuredDescriptionVehicleA = userData.injuredDescription;
            } else {
                myUserData.injuredVehicleA = false;
                myUserData.injuredDescriptionVehicleA = "non blessé";
            }
            // if(userData.witnesses){
                
            // }
            // if(userData.accidentSketch){
                
            // }
            if(userData.vehicleDamageComments){
                myUserData.vehicleADamageComments = userData.vehicleDamageComments ;
            }

            if (userData.vehicleTowed) {
                // Cambiar la lógica para verificar si el valor no es 'true' y no es 'false'
                if(userData.vehicleTowed !== 'true' && userData.vehicleTowed !== 'false'){
                    return res.status(400).json({ msg: "le véhicule remorqué doit être <<vrai>> ou <<faux>>" });
                }
                if (userData.vehicleTowed === 'true') {
                    myUserData.vehicleATowed = true;
                } else if (userData.vehicleTowed === 'false') {
                    myUserData.vehicleATowed = false;
                }
            } else {
                return res.status(400).json({ msg: "Vous devez indiquer si votre véhicule a été remorqué" });
            }

            if(userData.vehicleDriverSignature){
                myUserData.vehicleADriverSignature = userData.vehicleDriverSignature;
            }

             

        } else if (userData.vehicleNumber === 'v02') {

            if (userData.vehicleDamage) {

                if (userData.vehicleDamage == 'true') {
                    if (!userData.vehicleDamageDescription) {
                        return res.status(400).json({ msg: "Vous devez introduire une description des dommages" });
                    }
                    myUserData.vehicleBDamage = true;
                    myUserData.vehicleBDamageDescription = userData.vehicleDamageDescription;
                } else {
                    myUserData.vehicleBDamage = false;
                    myUserData.vehicleBDamageDescription = "Aucun dommage"
                }
            }

            if (userData.injured && userData.injured == 'true') {
                if (!userData.injuredDescription) {
                    return res.status(400).json({ msg: "Vous devez fournir une description des lésions" });
                }
                myUserData.injuredVehicleB = true;
                myUserData.injuredDescriptionVehicleB = userData.injuredDescription;
            } else {
                myUserData.injuredVehicleB = false;
                myUserData.injuredDescriptionVehicleB = "non blessé";
            }
            // if(userData.witnesses){
                
            // }
            // if(userData.accidentSketch){
                
            // }
            if(userData.vehicleDamageComments){
                myUserData.vehicleBDamageComments = userData.vehicleDamageComments ;
            }

            if (userData.vehicleTowed) {
                // Cambiar la lógica para verificar si el valor no es 'true' y no es 'false'
                if(userData.vehicleTowed !== 'true' && userData.vehicleTowed !== 'false'){
                    return res.status(400).json({ msg: "le véhicule remorqué doit être <<vrai>> ou <<faux>>" });
                }
                if (userData.vehicleTowed === 'true') {
                    myUserData.vehicleBTowed = true;
                } else if (userData.vehicleTowed === 'false') {
                    myUserData.vehicleBTowed = false;
                }
            } else {
                return res.status(400).json({ msg: "Vous devez indiquer si votre véhicule a été remorqué" });
            }

            if(userData.vehicleDriverSignature){
                myUserData.vehicleBDriverSignature = userData.vehicleDriverSignature;
            }


        } else if (userData.vehicleNumber != 'v01' || userData.vehicleNumber != 'v02') {
            return res.status(400).json({ msg: "you must indicate vehicle's number" });

        }

        // console.log(myUserData);

        Object.assign(foundAccidentR, myUserData);


        const result = await accidentReportCollection.updateOne(
            { _id: accidentId }, 
            { $set: foundAccidentR } 
        );

        // Verifier si la mise à jour s'est déroulée avec succès
        if (result.modifiedCount === 0) {
            // La mise à jour a échoué
            return res.status(400).json({ msg: "Aucun changement n'a été effectué" });
        }

        res.status(201).json({ msg: "Hello from update accident report" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "GET Accident : Erreur de serveur interne", error: error });
    }
}


async function deleteAccidentReport(req, res) {
    try {

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

        const { id } = req.params;

        const accidentReportCollection = mainDb.collection(VEHICLES_COLLECTION);

        const reportToDelete = await accidentReportCollection.findOne({ _id: id });

        if (!reportToDelete) {
            return res.status(404).json({ msg: "Profil introuvable" });
        }

        await userCollection.deleteOne({ _id: userToDelete._id });


        return res.status(200).json({ msg: 'Constat supprimé avec succès' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "GET Accident : Erreur de serveur interne", error: error });
    }
}

async function getAccidentReport(req, res) {
    try {

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

        const { id } = req.params;

        const accidentReportCollection = mainDb.collection(ACCIDENTREPORTS_COLLECTION);

        const accidentRFound = await accidentReportCollection.findOne({ _id: id })

        if (!accidentRFound) {
            return res.status(404).json({ msg: "Accident Report not found" });
        }


        res.status(201).json({ msg: accidentRFound });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "GET Accident : Erreur de serveur interne", error: error });
    }
}



/**
 * Récupère la liste des rapports d'accident d'un utilisateur connecté, classée par ordre chronologique inverse.
 * @param {Object} req - Requête HTTP contenant les paramètres de pagination et l'identifiant de l'utilisateur.
 * @param {Object} res - Réponse HTTP pour retourner les rapports d'accident.
 * @returns {Object} Liste des rapports d'accident paginée.
 */
async function getUserAccidentReports(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const userId = myToken.user_id;
        const size = 1; // Un rapport par page
        const page = parseInt(req.query.page) || 1; // Numéro de la page

        // Calculer l'offset pour la pagination
        const offset = (page - 1) * size;

        // Récupérer les rapports d'accident de l'utilisateur, triés par date et heure décroissantes
        const accidentReports = await accidentReportCollection
            .find({ "vehicles.user": userId })
            .sort({ accidentDate: -1, hourAccident: -1 })  // Tri par date et heure décroissantes (plus récent au plus ancien)
            .skip(offset)
            .limit(size)
            .toArray();

        // Compter le nombre total de rapports pour la pagination
        const totalReports = await accidentReportCollection.countDocuments({ "vehicles.user": userId });

        return res.status(200).json({
            totalReports,
            totalPages: Math.ceil(totalReports / size),
            currentPage: page,
            reports: accidentReports
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
    }
}


/**
 * Récupère les détails des accidents de la personne connectée, triés par date et heure les plus récentes.
 * Les détails incluent la date de l'accident, les photos de profil des personnes impliquées,
 * les détails des véhicules (marque, modèle, année, numéro de plaque), les informations sur l'utilisateur concerné
 * (nom, adresse, numéro de téléphone), une photo du lieu de l'accident (si disponible), et une description de l'accident.
 * @param {Object} req - Requête HTTP contenant les paramètres de pagination et l'identifiant de l'utilisateur.
 * @param {Object} res - Réponse HTTP pour retourner les détails des accidents.
 * @returns {Object} Détails des accidents de la personne connectée triés par date et heure les plus récentes.
 */
async function getUserAccidentDetails(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const userId = myToken.user_id;

        // Récupérer tous les rapports d'accidents de l'utilisateur, triés par date et heure décroissantes
        const accidentReports = await accidentReportCollection
            .find({ "vehicles.user": userId })
            .sort({ accidentDate: -1, hourAccident: -1 })
            .toArray();

        if (!accidentReports || accidentReports.length === 0) {
            return res.status(404).json({ msg: "Aucun rapport d'accident trouvé pour cet utilisateur" });
        }

        // Préparer les détails à retourner
        const accidentDetails = accidentReports.map(report => ({
            accidentDate: report.accidentDate,
            profilesPhotos: report.vehicles.map(vehicle => vehicle.personalDetails.profileImagePath).filter(photo => !!photo),
            vehicleDetails: report.vehicles.map(vehicle => ({
                vehicleBrand: vehicle.vehicleDetails.registrationCertificate.vehicleBrand,
                vehicleModel: vehicle.vehicleDetails.registrationCertificate.year,
                licensePlateNumber: vehicle.vehicleDetails.registrationCertificate.licensePlateNumber
            })),
            userDetails: report.vehicles.find(vehicle => vehicle.user === userId).personalDetails,
            accidentPhoto: report.accidentSketch || "Photo non fournie",
            accidentDescription: report.vehicleDamageDescription || "Description non fournie"
        }));

        return res.status(200).json(accidentDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
    }
}


module.exports = {
    newAccidentReport,
    getAccidentReport,
    updateAccidentReport,
    joinToAccidentReport,
    getUserAccidentReports,
    getUserAccidentDetails
}