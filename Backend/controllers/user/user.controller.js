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
const DriverLicense = require('../../modeles/driver_license/driverLicense')
// VARIABLES
const AES_KEY = process.env.AES_KEY
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const DRIVERLICENSECOLLECTION = process.env.DRIVERSLICENSECOLLECTION;
const SECRETKEY_IDQR = process.env.SECRETKEY_IDQR;

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const drivingLicensesCollection = mainDb.collection(DRIVERLICENSECOLLECTION);

async function validateUpdateRegisterUserFields(req) {
    if (req.body.email) {
        // Validation de l'email
        await body('email')
            .isEmail().withMessage('L\'adresse e-mail est requise et doit être valide')
            .matches(/^.+@.+\..+$/).withMessage('L\'adresse e-mail est invalide, l\'arobase (@) est manquante').run(req);
    }
    if (req.body.name) {
        // Validation du nom
        await body('name').notEmpty().isLength({ min: 2 }).withMessage('Le nom est requis et doit contenir au moins 2 caractères.').run(req);
    }
    if (req.body.lastName) {
        // Validation du nom
        await body('lastName').notEmpty().isLength({ min: 2 }).withMessage('le nom de famille est requis et doit contenir au moins 2 caractères.').run(req);
    }
    // if (req.body.password) {
    //     // Validation du mot de passe
    //     // await body('password').isLength({ min: 8 }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Le mot de passe est requis et doit contenir au moins 8 caractères').run(req);
    //     return Promise.reject('La modification du mot de passe n\'est pas autorisée depuis cette route');
    // }
    if (req.body.phone) {
        // Validation du numéro de téléphone
        await body('phone').isNumeric().isLength({ min: 10 }).withMessage('Le numéro de téléphone est requis et doit être numérique').run(req);
    }
    if (req.body.address) {
        // Validation de l'adresse
        await body('address').isLength({ min: 4 }).withMessage('L\'adresse est requise et doit avoir au moins 4 caractères').run(req);
    }
    if (req.body.postalCode) {
        // Validation de postal code
        await body('postalCode').isLength({ min: 4 }).withMessage('Le code postal est requis et doit contenir au moins 4 caractères.').run(req);
    }
    if (req.body.province) {
        // Validation de province
        await body('province').isLength({ min: 4 }).withMessage('La province est requis et doit contenir au moins 4 caractères.').run(req);
    }
    if (req.body.city) {
        // Validation de ville
        await body('city').isLength({ min: 4 }).withMessage('La ville est requis et doit contenir au moins 4 caractères.').run(req);
    }
    if (req.body.country) {
        // Validation de ville
        await body('country').isLength({ min: 4 }).withMessage('Le pays est requis et doit contenir au moins 4 caractères.').run(req);
    }
    if (req.body.gender) {
        // Validation de genre
        await body('gender').isLength({ min: 4 }).withMessage('Le genre est requis et doit contenir au moins 4 caractères.').run(req);
    }
    if (req.body.birthdate) {
        // Validation de date
        // await body('birthDay').isDate().withMessage('La date est requise et doit être du type date').run(req);
        // Validación de fecha
        // await body('birthDay')
        //     .custom(value => {
        //         // Intenta crear un objeto Date a partir de la cadena
        //         const date = new Date(value);
        //         // Verifica si el objeto Date es válido
        //         if (isNaN(date.getTime())) {
        //             // Si no es válido, devuelve un mensaje de error
        //             throw new Error('La date est requise et doit être du type date');
        //         }
        //         // Si es válido, devuelve true para indicar que la validación pasó
        //         return true;
        //     })
        //     .run(req);
        await body('birthdate').notEmpty().withMessage('La date est requise et doit être du type date').run(req);
    }
    if (req.body.newPassword) {
        // console.log(req.body.newPassword);
        await body('newPassword').notEmpty().withMessage('Le mot de passe est requis').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères').run(req);
    }

}
/*
async function validateRegisterUserFields(req) {
    await Promise.all([
        // Validation de l'email
        body('email')
            .isEmail().withMessage('L\'adresse e-mail est requise et doit être valide')
            .matches(/^.+@.+\..+$/).withMessage('L\'adresse e-mail est invalide, l\'arobase (@) est manquante').run(req),
        // Validation du nom
        body('name').notEmpty().isLength({ min: 2 }).withMessage('Le nom est requis et doit contenir au moins 2 caractères.').run(req),

        // Validation du nom
        body('lastName').notEmpty().isLength({ min: 2 }).withMessage('le nom de famille est requis et doit contenir au moins 2 caractères.').run(req),

        // Validation du mot de passe
        body('password').isLength({ min: 8 }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Le mot de passe est requis et doit contenir au moins 8 caractères').run(req),
        // body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre').run(req),

        // Validation du numéro de téléphone
        body('phone').isNumeric().isLength({ min: 10 }).withMessage('Le numéro de téléphone est requis et doit être numérique').run(req),

        // Validation de l'adresse
        body('address').isLength({ min: 4 }).withMessage('L\'adresse est requise et doit avoir au moins 4 caractères').run(req),

        // Validation de postal code
        body('postalCode').isLength({ min: 4 }).withMessage('Le code postal est requis et doit contenir au moins 4 caractères.').run(req),

        // Validation de province
        body('province').isLength({ min: 4 }).withMessage('La province est requis et doit contenir au moins 4 caractères.').run(req),

        // Validation de ville
        body('city').isLength({ min: 4 }).withMessage('La ville est requis et doit contenir au moins 4 caractères.').run(req),

        // Validation de ville
        body('country').isLength({ min: 4 }).withMessage('Le pays est requis et doit contenir au moins 4 caractères.').run(req),

        // Validation de genre
        body('gender').isLength({ min: 4 }).withMessage('Le genre est requis et doit contenir au moins 4 caractères.').run(req),
        // Validation de date
        //  body('birthDay').isDate().withMessage('La date est requise et doit être du type date').run(req),
        // Validación de fecha
        //  body('birthDay')
        //     .custom(value => {
        //         // Intenta crear un objeto Date a partir de la cadena
        //         const date = new Date(value);
        //         // Verifica si el objeto Date es válido
        //         if (isNaN(date.getTime())) {
        //             // Si no es válido, devuelve un mensaje de error
        //             throw new Error('La date est requise et doit être du type date');
        //         }
        //         // Si es válido, devuelve true para indicar que la validación pasó
        //         return true;
        //     })
        //     .run(req),
        body('birthDay').notEmpty().withMessage('La date est requise et doit être du type date').run(req),
    ]);
} */

async function validateRegisterUserFields(req) {
    await Promise.all([

        body('email')
            .isEmail().withMessage('L\'adresse e-mail est requise et doit être valide')
            .matches(/^.+@.+\..+$/).withMessage('L\'adresse e-mail est invalide, l\'arobase (@) est manquante').run(req),

        body('firstName').optional().notEmpty().isLength({ min: 2 }).withMessage('Le nom est requis et doit contenir au moins 2 caractères.').run(req),

        body('lastName').optional().notEmpty().isLength({ min: 2 }).withMessage('le nom de famille est requis et doit contenir au moins 2 caractères.').run(req),

        body('password').notEmpty().isLength({ min: 8 }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Le mot de passe est requis et doit contenir au moins 8 caractères').run(req),

        body('phone').optional().isNumeric().isLength({ min: 10 }).withMessage('Le numéro de téléphone est requis et doit être numérique').run(req),

        body('address').optional().isLength({ min: 4 }).withMessage('L\'adresse est requise et doit avoir au moins 4 caractères').run(req),

        body('postalCode').optional().isLength({ min: 4 }).withMessage('Le code postal est requis et doit contenir au moins 4 caractères.').run(req),

        body('province').optional().isLength({ min: 4 }).withMessage('La province est requis et doit contenir au moins 4 caractères.').run(req),

        body('city').optional().isLength({ min: 4 }).withMessage('La ville est requis et doit contenir au moins 4 caractères.').run(req),

        body('country').optional().isLength({ min: 4 }).withMessage('Le pays est requis et doit contenir au moins 4 caractères.').run(req),

        body('gender').optional().isLength({ min: 4 }).withMessage('Le genre est requis et doit contenir au moins 4 caractères.').run(req),

        body('birthdate').optional().notEmpty().withMessage('La date est requise et doit être du type date').run(req),
    ]);
}

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

/*async function RegisterUser(req, res) {
    try {
        // Extraction des données de la requête
        const { email, name, lastName, password, phone, address, postalCode,
            province, city, country, gender, birthDay, companyName
        } = req.body;
        const emailLowerCase = email.toLowerCase();

        // Validation des champs de la requête
        await validateRegisterUserFields(req);
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // Vérification si l'utilisateur existe déjà dans Onfido
        let userExisting = await userCollection.findOne({ email: emailLowerCase });
        if (userExisting) {
            return res.status(400).json({ msg: "Cet utilisateur existe déjà" });
        }

        // Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création de l'objet User
        const newUser = new User({
            email: emailLowerCase,
            name: name,
            lastName: lastName,
            password: hashedPassword,
            phone: phone,
            address: address,
            postalCode: postalCode,
            companyName: companyName,
            province: province,
            city: city,
            country: country,
            gender: gender,
            birthDay: birthDay,
            typeAccount: "free",
        });

        // Création de l'applicant dans Onfido
        const applicantResult = await createApplicant(newUser);

        // Vérification du résultat de la création de l'applicant dans Onfido
        if (!applicantResult.success) {
             return res.status(400).json({ msg: applicantResult.msg });
         }

        // Sauvegarde du nouvel utilisateur dans la collection 'users'
        const insertResult = await userCollection.insertOne(newUser);

        if (!insertResult.acknowledged) {
            return res.status(500).json({ msg: "Erreur lors de l'ajout d'un nouvel utilisateur" });
        }

        res.status(201).json({ msg: "Utilisateur créé avec succès", newUser: newUser._id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}
*/

async function RegisterUser(req, res) {
    try {
        // Extraction des données de la requête
        const { email, name, lastName, password, phone, address, postalCode,
            province, city, country, gender, birthdate, companyName
        } = req.body;

        const emailLowerCase = email.toLowerCase();

        // Validation des champs de la requête
        await validateRegisterUserFields(req);
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // Vérification si l'utilisateur existe déjà dans Onfido
        let userExisting = await userCollection.findOne({ email: emailLowerCase });
        if (userExisting) {
            return res.status(400).json({ msg: "Cet utilisateur existe déjà" });
        }

        // Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création de l'objet User
        const newUser01 = new User({
            email: emailLowerCase,
            name: name,
            lastName: lastName,
            password: hashedPassword,
            phone: phone,
            address: address,
            postalCode: postalCode,
            companyName: companyName,
            province: province,
            city: city,
            country: country,
            gender: gender,
            birthdate: birthdate,
            typeAccount: "free",
        });

        const newUser = new User({
            active: true,
            driverLicense: "pending",
            email: emailLowerCase,
            name: name || "pending",
            lastName: lastName || "pending",
            password: hashedPassword,
            phone: phone || "pending",
            address: address || "pending",
            postalCode: postalCode || "pending",
            province: province || "pending",
            city: city || "pending",
            country: country || "pending",
            gender: gender || "pending",
            birthdate: birthdate || "pending",
            typeAccount: "free",
        });

        newUser.set('documents', undefined);
        newUser.set('verificationCodeExpiration', undefined);
        newUser.set('verificationAttempts', undefined);
        newUser.set('verificationCode', undefined);
        newUser.set('accidentReports', undefined);
        //newUser.set('vehicles', undefined);

        // Sauvegarde du nouvel utilisateur dans la collection 'users'
        const insertResult = await userCollection.insertOne(newUser);

        if (!insertResult.acknowledged) {
            return res.status(500).json({ msg: "Erreur lors de l'ajout d'un nouvel utilisateur" });
        }

        const temporalToken = jwt.createTemporalToken(newUser);

        res.status(201).json({ msg: "Utilisateur créé avec succès", newUser: newUser._id, TA7: temporalToken });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function Login(req, res) {
    try {

        const { email, password } = req.body;
        // Validation des champs de la requête
        await body('email').isEmail().withMessage("L'adresse e-mail est invalide").notEmpty().withMessage("L'adresse e-mail est requise").run(req);
        await body('password').notEmpty().withMessage('Le mot de passe est requis').run(req);
        // Vérification des erreurs de validation
        const validationErrors = validationResult(req);

        // const randomCode = generateVerificationCode();
        // await sendVerificationEmail('nelson.cuervo89@gmail.com', randomCode);

        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }
        // On convertit l'adresse e-mail en minuscules pour assurer une recherche insensible à la casse
        const emailLowerCase = email.toLowerCase();

        const loggedInUser = await userCollection.findOne({ "email": emailLowerCase });

        if (!loggedInUser) {
            return res.status(403).json({ msg: "user not found" });
        }
        if (loggedInUser.active) {

            const passwordMatch = await bcrypt.compare(password, loggedInUser.password);
            if (passwordMatch) {
                token = jwt.createAccessToken(loggedInUser);
                // Réinitialiser le nombre de tentatives si la connexion est réussie
                await userCollection.updateOne({ "_id": loggedInUser._id }, { $set: { loginAttempts: 0 } });
                return res.status(200).json({ msg: "Utilisateur authentifié avec succès", A7: token, user: loggedInUser._id });
            } else {

                // Augmenter le nombre de tentatives si le mot de passe est erroné
                const updatedUser = await userCollection.findOneAndUpdate(
                    { "_id": loggedInUser._id },
                    { $inc: { loginAttempts: 1 } },
                    { returnDocument: 'after' }
                );

                // Vérifier si la limite de tentatives a été dépassée
                if (updatedUser.loginAttempts >= 3) {
                    // Bloquer le compte
                    await userCollection.updateOne({ "_id": loggedInUser._id }, { $set: { active: false } });
                    return res.status(401).json({ msg: "Compte bloqué suite à plusieurs tentatives infructueuses" });
                } else {
                    return res.status(401).json({ msg: "Mot de passe incorrect" });
                }
            }
        } else {
            res.status(401).json({ msg: "Compte inactif, contactez l'administrateur." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function Logout(req, res) {

    // res.status(200).json({ msg: "hello from logout" });
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

        // const userEmail = myToken.user_email; // Assurez-vous que le token contient bien l'email
        // Révoquer le jeton
        jwt.revokeToken(token);

        // Envoyer une réponse réussie en cas de déconnexion réussie
        console.info('Déconnexion réussie');
        res.status(200).json({ msg: 'Déconnexion réussie' });

    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur du serveur
        console.error(`Erreur lors de la déconnexion : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function RefresLogin(req, res) {

    try {
        const { token } = req.body;
        if (!token) res.status(400).send({ msg: "Token required" });

        const { user_id } = jwt.decoded(token);

        const loggedInUser = await userCollection.findOne({ _id: user_id });
        //Vérifier si l'utilisateur existe et si son compte est actif dans le système.
        if (!loggedInUser || loggedInUser.active === false) {
            return res.status(403).json({ msg: "Utilisateur présentant des problèmes avec le compte, contactez l'administrateur" });
        }

        refreshToken = jwt.createRefreshToken(loggedInUser);
        //révoquer l'ancien token
        jwt.revokeToken(token);

        res.status(200).json({ msg: "Session rafraîchie avec succès ", A7: refreshToken, user: loggedInUser._id });

    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur du serveur
        console.error(`Erreur lors de la déconnexion : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

/*async function GetUserById(req, res) {

    try {
        const userId = req.params.id;

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

        const userProfile = await userCollection.findOne({ _id: userId });

        if (!userProfile) {
            return res.status(404).json({ msg: "Profil introuvable" });
        }

        res.status(200).json({ user: userProfile });

    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur du serveur
        console.error(`Erreur lors de la déconnexion : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}*/

async function GetUserById(req, res) {
    try {
        const userId = req.params.id;

        // Récupérer le jeton du header de la requête
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

        const ownerId = myToken.user_id;

        if (ownerId !== userId) {
            return res.status(400).json({ msg: "Impossible d'afficher cette utilisateur" });
        }

        // Vérification si les données du locataire sont en cache
        const cacheKey = `${ownerId}`;
        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            // Si les données sont en cache, les renvoyer directement
            console.log("Données trouvées dans le cache. Retour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            return res.status(200).json({ vehicle: decryptedData });
        }

        const userProfile = await userCollection.findOne({ _id: userId });

        if (!userProfile) {
            return res.status(404).json({ msg: "Profil introuvable" });
        }

        res.status(200).json({ user: userProfile });
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse d'erreur du serveur
        console.error(`Erreur lors de la déconnexion : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function RestorePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
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
        // Récupérer l'utilisateur à partir de la base de données
        const loggedInUser = await userCollection.findOne({ _id: myToken.user_id });
        //Vérifier si l'utilisateur existe et si son compte est actif dans le système.
        if (!loggedInUser || loggedInUser.active === false) {
            return res.status(403).json({ msg: "Utilisateur présentant des problèmes avec le compte, contactez l'administrateur" });
        }
        // Vérifier si le mot de passe actuel correspond à celui stocké dans la base de données
        const passwordMatch = await bcrypt.compare(oldPassword, loggedInUser.password);
        if (!passwordMatch) {
            return res.status(403).json({ msg: "L'ancien mot de passe est incorrect" });
        }
        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        // Mettre à jour l'utilisateur dans la base de données avec le nouveau mot de passe
        await userCollection.updateOne(
            { _id: myToken.user_id },
            {
                $set: { password: hashedNewPassword }
            });

        return res.status(200).json({ msg: "Le mot de passe a été mis à jour avec succès" });

    } catch (error) {
        console.error(`Erreur lors de la modification du mot de passe  : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function EditUser(req, res) {
    try {

        const userData = req.body;
        // const { id } = req.params;
        // console.log(id);
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

        const id = myToken.user_id;

        if (req.body.password) {
            return res.status(403).json({ msg: 'La modification du mot de passe n\'est pas autorisée depuis cette route' });
        }

        // ..... VALIDATE FIELDS
        // Validation des champs de la requête
        await validateUpdateRegisterUserFields(req);
        // Vérification des erreurs de validation
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }


        // Utiliser Promise.all pour récupérer les données de de l'utilisateur à modifier 
        // et vérifier si le statut de la personne qui exécute l'action est actif.
        const [foundUser, isActiveUser] = await Promise.all([
            userCollection.findOne({ _id: id }),
            userCollection.findOne({ _id: myToken.user_id })
        ]);

        if (!foundUser) {
            return res.status(403).json({ msg: "Utilisateur non trouvé" });
        }

        //Vérifier si l'utilisateur existe et si son compte est actif dans le système.
        // if (!isActiveUser || isActiveUser.active === false) {
        //     return res.status(403).json({ msg: "Utilisateur présentant des problèmes avec le compte, contactez l'administrateur" });
        // }

        // Mettre à jour les données de la propriété avec les nouvelles données
        Object.assign(foundUser, userData);

        // Convertir le champ " active " en booléen s'il s'agit d'une chaîne de texte.
        if (typeof foundUser.active === 'string') {
            foundUser.active = foundUser.active.toLowerCase() === 'true';
        }

        // Obtenez le nom des images et stockez-les dans le tableau s'il y en a
        if (req.files && Object.keys(req.files).length > 0) {

            // Vérifier que les fichiers respectent la taille maximale autorisée.
            const { isValid: isSizeValid, fileName: oversizedFileName } = checkFileSize(req.files);

            // Vérifier que le nombre de fichiers ne dépasse pas la limite autorisée.
            const maxFileQuantity = 3; // Définit le nombre maximum de fichiers autorisés.
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

            // Initialiser un tableau pour les photos si des fichiers sont présents dans la requête
            let photos_ = [];
            let selfie = '';
            // Parcourir les photos envoyées dans la requête et les ajouter au tableau de photos

            for (let i = 1; i <= maxFileQuantity; i++) {

                if (req.files && req.files[`image${i}`]) {
                    const myImagePathName = getFileName(req.files[`image${i}`]);
                    photos_.push(myImagePathName);
                }
            }

            selfie = getFileName(req.files['selfie']);

            foundUser.selfie = selfie;
            foundUser.photos = photos_;
        }

        // Appel de verifyDocuments pour vérifier les documents de l'utilisateur
        // const verificationResult = await verifyDocuments(foundUser);

        // // Récupération des résultats de la vérification des documents
        // const drivingLicenseVerificationResult = verificationResult.drivingLicense;

        // if (!drivingLicenseVerificationResult.success) {
        //     // Si la vérification du permis de conduire a échoué
        //     return res.status(400).json({ msg: "La vérification du permis de conduire a échoué", error: drivingLicenseVerificationResult.msg });
        // }

        const result = await userCollection.updateOne(
            { _id: id }, // Filtre pour trouver la propriété par son ID
            { $set: foundUser } // Données actualisées souhaitées
        );
        // Verifier si la mise à jour s'est déroulée avec succès
        if (result.modifiedCount === 0) {
            // La mise à jour a échoué
            return res.status(400).json({ msg: "Aucun changement n'a été effectué" });
        }

        return res.status(200).json({ msg: "user has been modified" });

    } catch (error) {
        console.error(`Erreur interne du serveur : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function SendVerificationCode(req, res) {
    try {
        const { email } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await userCollection.findOne({ email });
        // Si l'utilisateur n'existe pas ou s'il n'est pas actif, renvoyer une erreur 404
        if (!user || !user.active) {
            return res.status(404).json({ msg: "Impossible d'exécuter cette action" });
        }

        // Générer le code de vérification
        const verificationCode = generateVerificationCode();
        // Récupérer le nombre actuel de tentatives de vérification de l'utilisateur
        let currentVerificationAttempts = user.verificationAttempts;
        // console.log(currentVerificationAttempts);

        // Vérifier si le nombre de tentatives de vérification est supérieur ou égal à 3
        if (currentVerificationAttempts > 3) {
            // Si le nombre de tentatives dépasse 3, bloquer le compte utilisateur
            await userCollection.updateOne(
                { _id: user._id },
                {
                    $set: { active: false }
                });
            // Renvoyer un code d'erreur 429 (Trop de requêtes) pour indiquer que la limite de tentatives de vérification a été dépassée
            return res.status(429).json({ msg: "Accès protégé, contacter un administrateur" });
        }

        // Mettre à jour l'utilisateur dans la base de données avec le nouveau code de vérification et d'autres champs
        await userCollection.updateOne(
            { $and: [{ _id: user._id }, { email: user.email }] }, // Filtre pour trouver l'utilisateur par son ID et  adresse e-mail
            {
                $set: {
                    verificationCode,
                    verificationAttempts: currentVerificationAttempts + 1,
                    verificationCodeExpiration: new Date(new Date().getTime() + 15 * 60000) // 15 minutes d'expiration
                }
            }
        );

        // Envoyer le code de vérification par e-mail à l'utilisateur
        // await sendVerificationEmail(user.email, verificationCode);

        return res.status(200).json({ msg: "Un code de vérification a été envoyé à votre adresse électronique.", code: verificationCode });
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'utilisateur ou lors de l'envoi du code de vérification : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function verifyAndChangePassword(req, res) {
    try {
        const { email, verificationCode, newPassword } = req.body;
        // Vérifier si le nouveau mot de passe est fourni
        if (!newPassword) {
            return res.status(400).json({ msg: "Veuillez introduire votre nouveau mot de passe" });
        }

        // Validation des champs de la requête
        await validateUpdateRegisterUserFields(req);
        // Vérification des erreurs de validation
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // Rechercher l'utilisateur par son adresse e-mail
        const user = await userCollection.findOne({ email });
        if (!user || !user.active) {
            return res.status(404).json({ msg: "Utilisateur non trouvé ou compte non actif" });
        }

        // Vérifier si le code de vérification est correct et non expiré
        if (user.verificationCode !== verificationCode || new Date() > user.verificationCodeExpiration) {
            // Incrémenter le compteur de tentatives de vérification
            await userCollection.updateOne(
                { $and: [{ _id: user._id }, { email: user.email }] }, // Filtrer par _id et email
                {
                    $set: {
                        verificationAttempts: user.verificationAttempts + 1,
                    }
                }
            );

            // Vérifier si le nombre de tentatives de vérification a été dépassé
            if (user.verificationAttempts > 3) {
                // Bloquer le compte utilisateur s'il y a eu trop de tentatives
                await userCollection.updateOne(
                    { _id: user._id },
                    { $set: { active: false } }
                );
                return res.status(423).json({ msg: "Accès protégé, contacter un administrateur" });
            }

            return res.status(403).json({ msg: "Code de vérification incorrect ou expiré. Veuillez réessayer." });
        }

        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe et réinitialiser le code de vérification
        await userCollection.updateOne(
            { email },
            {
                $set: {
                    password: hashedNewPassword,
                    verificationCode: undefined,
                    verificationAttempts: 0,
                    verificationCodeExpiration: undefined
                }
            }
        );

        return res.status(200).json({ msg: "Le mot de passe a été modifié avec succès." });
    } catch (error) {
        console.error(`Erreur lors de la vérification du code de vérification ou du changement de mot de passe : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function DeleteUser(req, res) {
    try {

        const { id } = req.params;
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

        const userToDelete = await userCollection.findOne({ _id: id });

        if (!userToDelete) {
            return res.status(404).json({ msg: "Profil introuvable" });
        }

        await userCollection.deleteOne({ _id: userToDelete._id });

        return res.status(200).json({ msg: 'User supprimé avec succès' });
    } catch (error) {
        console.error(`Delete User: Erreur interne du serveur : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function UploadDocument(req, res) {
    try {
        const { docType } = req.body;
        const documentFile = req.files.document;

        const docsAdmitedTypes = ['driverLicence', 'carInsurance'];


        if (!docsAdmitedTypes.includes(docType) || !docType) {
            return res.status(400).json({ msg: "Doc type not valid" });
        }

        if (!documentFile) {
            return res.status(400).json({ msg: "You must introduce a valid photo" });
        }

        const documentText = await processDocument(documentFile);

        if (!documentText || documentText === 'Incompatible_format') {
            return res.status(400).json({ msg: 'Impossible de lire le document, vérifiez le format et la qualité de l\'image.' });
        }

        let extractedInfo


        if (docType === 'driverLicence') {
            console.log("Hello from driver licence");
            extractedInfo = processLicenseText(documentText);
        }

        if (docType === 'carInsurance') {
            extractedInfo = processInsuranceText(documentText);
            console.log("Hello from auto Assurance");
        }

        // return res.status(200).json({ msg: 'Voici le document'});
        return res.status(200).json({ msg: 'Voici le document', document: documentText, extractedInfoText: extractedInfo });

        // return res.status(200).json({ msg: 'Hello from yupload document ' });
    } catch (error) {
        console.error(`UploadDocument: Erreur interne du serveur : ${error.message}`);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
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


async function generateQRCode01(req, res) {
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

        const userId = myToken.user_id;

        console.log(userId);

        // const saltRounds = 24; 
        //const hashedUserId = await bcrypt.hash(userId, saltRounds);

        const myIdhashed = await bcrypt.hash(userId, 7);

        // const myIdhashed = await encryptUserId(userId);
        console.log(myIdhashed);
        // console.log(hashedUserId);

        const qrData = {
            id: myIdhashed,
            // id: userId,
            // msg: 'Mani nos pueden hackear'
        }; // Puedes ajustar los datos del código QR según tus necesidades

        // Generar el código QR
        const qrImage = await qr.toDataURL(JSON.stringify(qrData));

        // // Devolver el código QR como respuesta
        // res.status(200).send(qrImage);
        // Devolver el código QR como respuesta con el tipo de contenido apropiado
        res.setHeader('Content-Type', 'image/png');

        // Convertir la imagen PNG a base64
        // const qrImageData = Buffer.from(qrImage.split(',')[1], 'base64')
        // const qrBase64 = qrImageData.toString('base64');

        res.send(Buffer.from(qrImage.split(',')[1], 'base64'));
        // res.status(200).json({ qqBase64: qrBase64 });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error interno del servidor", error: error });
    }
}

async function generateQRCode(req, res) {
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

        const userId = myToken.user_id;
        //Check if user ID has Driver license
        const user = await userCollection.findOne({ _id: userId });

        if(!user || user.driverLicense === 'pending'){
            return res.status(400).json({ msg: "Veuillez mettre à jour les détails de votre permis de conduire." });
        }

        const myIdhashed = encryptDataAES(userId);

        const qrData = {
            id: myIdhashed.ed,
            iv: myIdhashed.iv,

        }; 

        // Générer un code QR
        const qrImage = await qr.toDataURL(JSON.stringify(qrData));

        // Renvoyer le code QR en tant que réponse avec le type de contenu approprié
        res.setHeader('Content-Type', 'image/png');
        // RESPONSE
        res.send(Buffer.from(qrImage.split(',')[1], 'base64'));


    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error interno del servidor", error: error });
    }
}


async function readAndSendUserInfo(req, res) {
    try {

        const { id, iv } = req.body;
        const decryptedDataId = decryptDataAES(id, iv);

        //Vérifier si l'id et l'iv sont présents dans le corps. 
        if (!id || !iv) {
            return res.status(400).json({ msg: "Veuillez compléter tous les champs pertinents" });
        }

        // Recherche de l'utilisateur dans la base de données à l'aide de l'ID de l'utilisateur
        const user = await userCollection.findOne({ _id: decryptedDataId });
        const driverLicense = await drivingLicensesCollection.findOne({ user: user._id });

        // Vérifier si l'utilisateur a été trouvé
        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé" });
        }
        if (!driverLicense) {
            return res.status(404).json({ msg: "Licensia introuvable" });
        }

        // // Renvoi des informations sur l'utilisateur en tant que réponse
        return res.status(200).json({ user: user, driverL: driverLicense });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur de serveur interne", error: error });
    }
}



module.exports = {
    RegisterUser,
    Login,
    Logout,
    RefresLogin,
    GetUserById,
    RestorePassword,
    EditUser,
    SendVerificationCode,
    verifyAndChangePassword,
    DeleteUser,
    UploadDocument,
    UploadDriverLicense,
    generateQRCode,
    readAndSendUserInfo
};


/*

                const newDriverLicense = new DriverLicense({
            user: myToken.user_id,
            number: number,
            name: myUser.name,
            lastName: myUser.lastName,
            birthdate: myUser.birthDay,
            address: address,
            appartment: appartment,
            province: province,
            postalCode: postalCode,
            licenseClass: licenseClass,
            sex: sex,
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
*/



