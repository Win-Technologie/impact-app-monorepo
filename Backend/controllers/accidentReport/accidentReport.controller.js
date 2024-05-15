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

// CACHE
const { myCache, encryptData, decryptData } = require("../../utils/cache");

// MODELS
const Accident = require('../../modeles/accidentReport/accidentReport');
const User = require('../../modeles/users/user');
const DriverLicense = require('../../modeles/driver_license/driverLicense');

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

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const drivingLicensesCollection = mainDb.collection(DRIVERLICENSECOLLECTION);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);
const accidentReportCollection = mainDb.collection(ACCIDENTREPORTS_COLLECTION);


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


async function newAccidentReport(req, res) {
    try {

        // ??????????????????????????????????????
       // const userAllInfo = getMyAutoFullInfo(req, res);

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

       const userAllInfo = req.body;
       const {owner,vehicle,insurance,driverLicense} = req.body;


        const now = new Date();
        // Crear una constante para la fecha actual
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Crear una constante para la hora actual
        const currentTime = new Date(1970, 0, 1, now.getHours(), now.getMinutes(), now.getSeconds());
        const issuedDateFormat = new Date(driverLicense.issued);
        const expiresDateFormat = new Date(driverLicense.expires);
        const dateDelivranceFormat = new Date(vehicle.immatriculation.dateDelivrance);
        const dateStartInsuranceFormat = new Date(insurance.startDate);

        const accidentReport = new Accident({
            accidentDate: currentDate,
            hourAccident: currentTime,
            vehicleA: {
                personalDetails: {
                    name: owner.name,
                    lastName: owner.lastName,
                    address: owner.address,
                    phone: owner.String,
                    email: owner.email,
                    user: myToken.user_id,
                    postalCode: owner.postalCode,
                    city: owner.city,
                    province: owner.province,
                    country: owner.country

                },
                drivingLicense: {
                    number: driverLicense.number,
                    licenseClass: driverLicense.licenseClass,
                    issuanceDate: issuedDateFormat,
                    expirationDate: expiresDateFormat,
                    driverLicenseId: driverLicense._id,
                },
                registrationCertificate: {
                    fileNumber: vehicle.immatriculation.numeroDossier,
                    vehicleBrand: vehicle.brand,
                    year: vehicle.year,
                    vehicleSerialNumber: vehicle.immatriculation.serialNumber,
                    licensePlateNumber: vehicle.plate,
                    dateDelivrance: dateDelivranceFormat,
                    immatriculationId: vehicle._id
                },
                insuranceCertification: {
                    insuranceCompany: insurance.insuranceCompany,
                    policyNumber: insurance.insuranceNumber,
                    effectiveDate: dateStartInsuranceFormat,
                    insuredName: owner.name,
                    insuredLastName: owner.lastName,
                    insuredAddress: owner.address,
                    insuredCity: owner.city,
                    insuredPhone: owner.String,
                    assuranceId: insurance._id,
                }
            }
        });

        // console.log(accidentReport);

        accidentReport.set('witnesses', undefined);

        // // Création d'une nouvelle instance du rapport d'accident
        // const accidentReport = new Accident({
        //     accidentDate: currentDate,
        //     hourAccident: currentTime,
        //     vehicleA: {
        //         personalDetails: {
        //             name: userAllInfo.owner.name,
        //             lastName: userAllInfo.owner.lastName,
        //             address: userAllInfo.owner.address,
        //             phone: userAllInfo.owner.phone,
        //             postalCode: userAllInfo.owner.postalCode,
        //             email: userAllInfo.owner.email
        //         },
        //         documents: {
        //             drivingLicense: {
        //                 issuanceDate: new Date(userAllInfo.driverLicense.issued),
        //                 expirationDate: new Date(userAllInfo.driverLicense.expires)
        //             },
        //             registrationCertificate: {
        //                 fileNumber: userAllInfo.vehicle.immatriculation.numeroDossier,
        //                 owner: userAllInfo.owner.name + ' ' + userAllInfo.owner.lastName,
        //                 address: userAllInfo.owner.address,
        //                 city: userAllInfo.owner.city,
        //                 postalCode: userAllInfo.owner.postalCode,
        //                 phone: userAllInfo.owner.phone,
        //                 vehicleBrand: userAllInfo.vehicle.brand,
        //                 year: userAllInfo.vehicle.year,
        //                 vehicleSerialNumber: userAllInfo.vehicle.serialNumber,
        //                 licensePlateNumber: userAllInfo.vehicle.plate,
        //                 issuanceDate: new Date(userAllInfo.vehicle.immatriculation.dateDelivrance)
        //             },
        //             insuranceCertification: {
        //                 policyNumber: userAllInfo.insurance ? userAllInfo.insurance.policyNumber : '',
        //                 effectiveDate: userAllInfo.insurance ? new Date(userAllInfo.insurance.effectiveDate) : null,
        //                 insuredName: userAllInfo.owner.name,
        //                 insuredLastName: userAllInfo.owner.lastName,
        //                 insuredAddress: userAllInfo.owner.address,
        //                 insuredCity: userAllInfo.owner.city,
        //                 insuredPhone: userAllInfo.owner.phone
        //             }
        //         }
        //     },

        // });

        // console.log(accidentReport);
       
        // // Save the accident report to the database
        const result = await accidentReportCollection.insertOne(accidentReport);

        console.log(result);

        // ???????????????????????????????????????????????
        // if (result.insertedCount !== 1) {
        //     throw new Error("Failed to create accident report");
        // }
        
        // // Return a success message
        // return res.status(201).json({ msg: "New accident report created successfully" });
        return res.status(201).json({ msg: "New accident report created successfully", result });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "New Accident : Erreur de serveur interne", error: error });
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

        const accidentReportCollection = mainDb.collection(VEHICLES_COLLECTION);

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


async function updateAccidentReport(req, res) {
    try {

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



module.exports = {
    newAccidentReport,
    getAccidentReport,
    updateAccidentReport
}