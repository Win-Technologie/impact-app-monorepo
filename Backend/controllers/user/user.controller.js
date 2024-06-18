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
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;

const SECRETKEY_IDQR = process.env.SECRETKEY_IDQR;

const path = require('path');
const fs = require('fs');


// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);
const drivingLicensesCollection = mainDb.collection(DRIVERLICENSECOLLECTION);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

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
        await body('country').isLength({ min: 2 }).withMessage('Le pays est requis et doit contenir au moins 2 caractères.').run(req);
    }
    if (req.body.gender) {
        // Validation de genre
        await body('gender').isLength({ min: 1 }).withMessage('Le genre est requis et doit contenir au moins 1 caractères.').run(req);
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

//CACHE : 
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


async function RegisterUserSendCode(req, res) {
    try {
        // Extraction des données de la requête
        const { email, password } = req.body;

        const emailLowerCase = email.toLowerCase();

        // Validation des champs
        await validateRegisterUserFields(req);
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // Vérification si l'utilisateur existe déjà
        const userExisting = await userCollection.findOne({ email: emailLowerCase });
        if (userExisting) {
            return res.status(400).json({ msg: "Cet utilisateur existe déjà" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création de l'objet Utilisateur
        const newUser = new User({
            active: true,
            driverLicense: "pending",
            email: emailLowerCase,
            emailVerified:false,
            name: "pending",
            lastName:  "pending",
            password: hashedPassword,
            phone: "pending",
            address: "pending",
            postalCode: "pending",
            province: "pending",
            city: "pending",
            country: "pending",
            gender: "pending",
            birthdate:  "pending",
            typeAccount: "free",
       
        });

        newUser.set('documents', undefined);
        newUser.set('verificationCodeExpiration', undefined);
        newUser.set('verificationAttempts', undefined);
        newUser.set('verificationCode', undefined);
        newUser.set('accidentReports', undefined);

        // Enregistrer le nouvel utilisateur dans la collection « users ».
        const insertResult = await userCollection.insertOne(newUser);


        if (!insertResult.acknowledged) {
            return res.status(500).json({ msg: "Erreur lors de l'ajout d'un nouvel utilisateur" });
        }

        // Générer le code de vérification
        const verificationCode = generateVerificationCode();

        // Mettre à jour l'utilisateur avec le code de vérification
        await userCollection.updateOne(
            { _id: newUser._id },
            {
                $set: {
                    verificationCode,
                    verificationCodeExpiration: new Date(new Date().getTime() + 15 * 60000) // délai d'expiration de 15 minutes
                }
            }
        );

        // Envoyer le code de vérification par courrier électronique
        await sendVerificationEmail(newUser.email, verificationCode);

        res.status(201).json({ msg: "Code envoyé avec succès"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
    }
}



async function RegisterUserVerifyCode(req, res) {
    try {
        const { email, verificationCode } = req.body;

        // Recherche de l'utilisateur par son adresse électronique
        const user = await userCollection.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé" });
        }

        // Vérifier que le code de vérification est correct et qu'il n'a pas expiré
        const currentTime = new Date().getTime();
        const codeExpirationTime = new Date(user.verificationCodeExpiration).getTime();

        if (user.verificationCode !== verificationCode || currentTime > codeExpirationTime) {
            // Incrémenter le compteur de tentatives de vérification
            await userCollection.updateOne(
                { _id: user._id },
                {
                    $set: { verificationAttempts: user.verificationAttempts + 1 }
                }
            );

             // Vérifier si les tentatives de vérification ont été réussies
            if (user.verificationAttempts > 3) {
                // Bloquer le compte de l'utilisateur si les tentatives ont été dépassées.
                await userCollection.updateOne(
                    { _id: user._id },
                    { $set: { active: false } }
                );
                return res.status(429).json({ msg: "Accès protégé, contacter un administrateur" });
            }

            return res.status(400).json({ msg: "Code de vérification invalide ou expiré. Veuillez réessayer." });
        }

        // Mise à jour du statut de l'utilisateur pour indiquer que l'adresse électronique de l'utilisateur a été vérifiée
        await userCollection.updateOne(
            { _id: user._id },
            {
                $set: { emailVerified: true },
                $unset: { verificationCode: "", verificationCodeExpiration: "", verificationAttempts: "" }
            }
        );

        //// Générer un tpoken d'accès temporaire
        const temporalToken = jwt.createTemporalToken(user);


        return res.status(201).json({
            msg: "Le code de vérification a été validé avec succès",
            user: user._id,
            TA7: temporalToken
        });

    } catch (error) {
        console.error(`Erreur lors de la vérification du code : ${error.message}`);
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
    }
}


/**
 * Fonction pour authentifier un utilisateur et lui renvoyer un token d'accès.
 * 
 * Cette fonction traite la requête de connexion d'un utilisateur. Elle vérifie si l'adresse e-mail et le mot de passe sont valides,
 * authentifie l'utilisateur, génère un token d'accès et renvoie les informations de l'utilisateur, y compris le chemin de son image de profil.
 * 
 * @param {*} req - La requête HTTP contenant les champs 'email' et 'password'.
 * @param {*} res - La réponse HTTP pour renvoyer le résultat de l'authentification.
 * @returns Renvoie une réponse JSON avec le statut de l'opération et les informations de l'utilisateur.
 */
async function Login(req, res) {
    try {
        const { email, password } = req.body;

        // Validation des champs de la requête
        await body('email').isEmail().withMessage("L'adresse e-mail est invalide").notEmpty().withMessage("L'adresse e-mail est requise").run(req);
        await body('password').notEmpty().withMessage('Le mot de passe est requis').run(req);

        // Vérification des erreurs de validation
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // On convertit l'adresse e-mail en minuscules pour assurer une recherche insensible à la casse
        const emailLowerCase = email.toLowerCase();

        // Rechercher l'utilisateur dans la base de données
        const loggedInUser = await userCollection.findOne({ "email": emailLowerCase });

        if (!loggedInUser) {
            return res.status(403).json({ msg: "user not found" });
        }

        if (loggedInUser.active) {
            // Vérifier si le mot de passe correspond
            const passwordMatch = await bcrypt.compare(password, loggedInUser.password);
            if (passwordMatch) {


                // Générer un token d'accès
                const token = jwt.createAccessToken(loggedInUser);

                // Réinitialiser le nombre de tentatives si la connexion est réussie
                await userCollection.updateOne({ "_id": loggedInUser._id }, { $set: { loginAttempts: 0 } });

                // Récupérer les informations système de l'utilisateur
                const userInfo = await getUserSystemInfo(loggedInUser);

                // Inclure l'image de profil dans la réponse
                return res.status(200).json({ 
                    msg: "Utilisateur authentifié avec succès", 
                    A7: token, 
                    user: { ...userInfo } 
                });
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



/**
 * Authentifie un utilisateur en utilisant un token JWT.
 * Cette fonction extrait le token JWT de l'en-tête de la requête,
 * vérifie et décrypte le token, puis renvoie les informations de l'utilisateur
 * si le token est valide et que l'utilisateur est actif.
 * 
 * @param {*} req - L'objet de requête Express, contenant les en-têtes et les données de la requête.
 * @param {*} res - L'objet de réponse Express, utilisé pour envoyer la réponse au client.
 * @returns {Object} - Renvoie un objet JSON contenant le message et les informations de l'utilisateur en cas de succès,
 *                     ou un message d'erreur en cas d'échec.
 */
async function LoginWithToken(req, res) {
    try {
        // Extraire le token de l'en-tête Authorization
        const token = req.headers.authorization?.replace("Bearer ", "");

        // Vérifier si le token est fourni
        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const ownerId = myToken.user_id; 
        const loggedInUser = await userCollection.findOne({ "_id": ownerId });

        // Vérifier si l'utilisateur existe
        if (!loggedInUser) {
            return res.status(403).json({ msg: "Utilisateur non trouvé" });
        }

        // Vérifier si le compte de l'utilisateur est actif
        if (loggedInUser.active) {
            // Vérifier si l'utilisateur a complété toutes les informations requises
            if (!loggedInUser.allFieldsComplete) {
                return res.status(403).send({ msg: "L'utilisateur n'a pas complété toute son inscription." });
            }

            // Obtenir les informations de l'utilisateur à partir d'une fonction utilitaire
            const userInfo = await getUserSystemInfo(loggedInUser);

            return res.status(200).json({ msg: "Utilisateur authentifié avec succès", user: userInfo });
        } else {
            return res.status(401).json({ msg: "Compte inactif, contactez l'administrateur." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
    }
}


//CACHE:
async function Logout(req, res) {

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

        // Révoquer le token
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
// CACHE
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
// CACHE
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
// CACHE
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

        let myBirthdate;

        if (userData.birthdate) {
            myBirthdate = new Date(userData.birthdate);
            userData.birthdate = myBirthdate;
        }


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


// CACHE
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

//CACHE
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

        const email = req.body.email ?? "";

        // Vérifier si l'un des paramètres est présent (id ou email)
        if (!id && !email) {
            return res.status(400).json({ msg: "Aucun paramètre fourni" });
        }


        if (id && email) {
            return res.status(400).json({ msg: "Double paramètre" });
        }

        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        // Trouver l'utilisateur à supprimer par ID ou par email
        const query = id ? { _id: id } : { email: email };
        const userToDelete = await userCollection.findOne(query);

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
        const { vehicleId } = req.body;

        if (!vehicleId) {
            return res.status(400).json({ msg: "Veuillez indiquer un véhicule." });
        }

        //Check if user ID has Driver license
        const user = await userCollection.findOne({ _id: userId });
        const vehicle = await vehicleCollection.findOne({ _id: vehicleId });

        if (!user || user.driverLicense === 'pending') {
            return res.status(400).json({ msg: "Veuillez mettre à jour les détails de votre permis de conduire." });
        }

        if (!vehicle || !user.vehicles.includes(vehicleId)) {
            return res.status(400).json({ msg: "Vérifier les véhicules de l'utilisateur." });
        }

        const concatenated_id = `uid:${userId}_vid:${vehicleId}`;

        // const myIdhashed = encryptDataAES(userId);
        const myIdhashed = encryptDataAES(concatenated_id);

        const qrData = {
            id: myIdhashed.ed,
            iv: myIdhashed.iv,
        };

        const userName = user.name;
        const userLastNAme = user.lastName;

        //  Obtenir les deux premières lettres de chaque chaîne
        const initials = `${replaceSpecialCharacters(userName.slice(0, 2))}${replaceSpecialCharacters(userLastNAme.slice(0, 2))}`;

        const alphaNum = generateAlphanumericCode(6);

        const AlphNumCode = `${initials}${alphaNum}`;


        await userCollection.updateOne(
            { _id: userId },
            {
                $set: {
                    alphaNumCode: AlphNumCode,
                    findMyVehicle: vehicleId
                }
            }
        );

        // my code 

        // console.log(qrData);

        // // Obtener id e iv
        // const id = myIdhashed.ed;
        // const iv = myIdhashed.iv;

        // // Generar el código corto
        // const codigoCortoGenerado = generarCodigoCorto(id, iv);
        // console.log("Código corto generado:", codigoCortoGenerado);

        // // Decodificar el código corto para obtener id e iv
        // const valoresOriginales = decodificarCodigoCorto(codigoCortoGenerado);
        // console.log("Valores originales obtenidos:", valoresOriginales);

        // // Générer un code QR
        // const qrImage = await qr.toDataURL(JSON.stringify(qrData));

        // // Renvoyer le code QR en tant que réponse avec le type de contenu approprié
        // res.setHeader('Content-Type', 'image/png');
        // // RESPONSE
        // res.send(Buffer.from(qrImage.split(',')[1], 'base64'));

        // Générer un code alphanumérique
        // const alphanumericCode = generateAlphanumericCode(qrData);

        // Générer un code QR
        // const qrImageBuffer = await qr.toBuffer(JSON.stringify(qrData));
        // const cleanQRBase64 = qrImageBuffer.toString('base64');


        // /** BASE 64 */
        const qrImage = await qr.toDataURL(JSON.stringify(qrData));

        // // Retourne le code QR en base64 et alphanumérique comme réponse
        // return res.status(200).json({ qrImage});
        // return res.status(200).json({ cleanQRBase64 });


        console.log(qrData);
        /* LAMINE */
        // Renvoyer le code QR en tant que réponse avec le type de contenu approprié
        res.setHeader('Content-Type', 'text/plain');
        // RESPONSE
        res.status(200).json({ qrImage, AlphNumCode });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error interno del servidor", error: error });
    }
}

function replaceSpecialCharacters(string) {
    return string.replace(/[áÁéÉíÍóÓúÚüÜ']/g, 'Z');
}

function generateAlphanumericCode(size) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';

    // Obtain four random characters without repetition
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function extractIds(dataString) {
    // Expression régulière pour rechercher les valeurs de userId et vehicleId
    const regex = /uid:([a-zA-Z0-9]+)_vid:([a-zA-Z0-9]+)/;
    // Exécute l'expression régulière sur la chaîne fournie
    const matches = dataString.match(regex);
    // Vérifier si des correspondances ont été trouvées
    if (matches && matches.length === 3) {
        const userId = matches[1];
        const vehicleId = matches[2];
        return { userId, vehicleId };
    } else {
        throw new Error("Les identifiants n'ont pas pu être extraits de la chaîne fournie.");
    }
}

async function readAndSendUserInfo(req, res) {
    try {

        const { id, iv, alphaNum } = req.body;


        if (alphaNum) {

            const user = await userCollection.findOne({ alphaNumCode: alphaNum });

            if (!user) {
                return res.status(404).json({ msg: "Le code alphanumérique ne fonctionne pas" });
            }

            if (user.alphaNumCode == 'non' || user.findMyVehicle == 'non') {
                return res.status(404).json({ msg: "Demander un nouveau code alphanumérique" });
            }

            let { response, statusCode, msg } = await getUserInfo(user._id, user.findMyVehicle);

            if (!response) {
                return res.status(statusCode).json({ msg });
            }

            await userCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        alphaNumCode: "non",
                        findMyVehicle: "non"
                    }
                }
            );

            // Renvoi des informations sur l'utilisateur en tant que réponse
            return res.status(statusCode).json({ msg, response });


        } else {

            //Vérifier si l'id et l'iv sont présents dans le corps. 
            if (!id || !iv) {
                return res.status(400).json({ msg: "Veuillez compléter tous les champs pertinents" });
            }

            const decryptedDataId = decryptDataAES(id, iv);

            const { userId, vehicleId } = extractIds(decryptedDataId);

            let { response, statusCode, msg } = await getUserInfo(userId, vehicleId);

            if (!response) {
                return res.status(statusCode).json({ msg });
            }
            // Renvoi des informations sur l'utilisateur en tant que réponse
            return res.status(statusCode).json({ msg, response });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur de serveur interne", error: error });
    }
}

async function getUserInfo(userId, vehicleId) {
    try {
        const [user, vehicle, insurance, driverLicense] = await Promise.all([
            userCollection.findOne({ _id: userId }),
            vehicleCollection.findOne({ _id: vehicleId }),
            insuranceCollection.findOne({ vehicle: vehicleId }),
            drivingLicensesCollection.findOne({ user: userId })
        ]);

        let statusCode = 200;
        let msg = "Success";
        let response = null;

        if (!user) {
            statusCode = 404;
            msg = "Utilisateur non trouvé";
        } else if (!user.vehicles.includes(vehicleId)) {
            statusCode = 404;
            msg = "L'utilisateur n'enregistre pas le véhicule envoyé";
        } else if (!vehicle) {
            statusCode = 404;
            msg = "Véhicule non trouvé";
        } else if (!driverLicense) {
            statusCode = 404;
            msg = "Permis de conduire introuvable";
        } else {
            let vehicleOwner = (vehicle.owner !== user._id) ? await userCollection.findOne({ _id: vehicle.owner }) : user;

            if (!insurance) {
                statusCode = 404;
                msg = "Assurance non trouvée";
            }

            response = {
                owner: {
                    name: vehicleOwner.name,
                    lastName: vehicleOwner.lastName,
                    email: vehicleOwner.email,
                    phone: vehicleOwner.phone,
                    address: vehicleOwner.address,
                    postalCode: vehicleOwner.postalCode,
                    city: vehicleOwner.city,
                    province: vehicleOwner.province,
                    country: vehicleOwner.country
                },
                vehicle,
                insurance,
                driverLicense
            };
        }

        return { response, statusCode, msg };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getMyAutoFullInfo(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const { vehicleId } = req.params;

        const { response, statusCode, msg } = await getUserInfo(myToken.user_id, vehicleId);

        if (!response) {
            return res.status(statusCode).json({ msg });
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur de serveur interne", error: error });
    }
}


async function encryptMyData(req, res) {


    /** BACKEND */
    const data = 'FrontImpactTechByWinTech';

    const encryptedData = encryptDataAES(data);

    const authKey = 'ImpactFront'

    // const myFullData = `${encryptedData.iv}_${encryptedData.ed}`;

    // const myFullData = `${encryptedData.iv}_${encryptedData.ed}_${authKey}`;

    console.log(myFullData);
    console.log(myFullData);
    console.log(myFullData);
    console.log(myFullData);

    /* FRONTEND */

    const myFullData = `${encryptedData.iv}_${encryptedData.ed}_${authKey}`;

    const encryptedDataFull = encryptDataAES(myFullData);
    console.log('*********************');
    console.log('*********************');
    console.log('*********************');
    console.log(encryptedDataFull);
    console.log('*********************');
    console.log('*********************');
    console.log('*********************');


    const decryptedDataFull = decryptDataAES(encryptedDataFull.ed, encryptedDataFull.iv);


    const parts = decryptedDataFull.split('_');

    // El primer elemento es el valor 'ed'
    const iv = parts[0];

    // El segundo elemento es el valor 'iv'
    const ed = parts[1];

    // El tercer elemento es el valor 'Impact_front'
    const impactFront = parts[2];

    console.log('Valor ed:', ed);
    console.log('Valor iv:', iv);
    console.log('Valor Impact_front:', impactFront);


    // const decryptedData = decryptDataAES(decryptedDataFull, encryptedDataFull.iv);
    // console.log('*********************');
    // console.log('decryptedData');
    // console.log(decryptedData);
    // console.log('*********************');


    res.status(200).json({ encryptedData, encryptedDataFull });




}


// Fonction principale pour valider l'inscription
async function validateInscription(req, res) {
    try {
        // Valider et décoder le token d'autorisation
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            // Si le token n'est pas fourni, renvoyer une erreur 400
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token);
        // Si le token est invalide, renvoyer une erreur 400
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }
        // Obtenir l'identifiant de l'utilisateur soit à partir des paramètres de la requête soit du token décodé
        const id = req.params.id || myToken.user_id;

        /* USER */

        // Obtenir l'utilisateur à partir de la collection userCollection
        // Rechercher l'utilisateur dans la base de données
        const myUser = await userCollection.findOne({ _id: id });
        if (!myUser) {
            // Si l'utilisateur n'existe pas, renvoyer une erreur 400
            return res.status(400).json({ msg: "User doesn't exist" });
        }

        // Définir les champs de l'utilisateur à vérifier
        const userFieldsToCheck = [
            "name", "lastName", "email", "phone", "password",
            "address", "postalCode", "city", "province", "country",
            "gender", "typeAccount",
            "birthdate", "sessionId", "vehicles",
            // "allConditionsAccepted",
        ];
        // Trouver les champs manquants pour l'utilisateur
        const missingUserFields = findMissingFields(myUser, userFieldsToCheck);
        // Si des champs sont manquants, renvoyer une erreur 400
        if (missingUserFields.length > 0) {
            return res.status(400).json({ msg: "User: Les champs suivants sont manquants", name: myUser.name, missingFields: missingUserFields });
        }

        /* VEHICLE */

        // Obtenir les véhicules de l'utilisateur et leurs champs à vérifier
        const vehicles = await vehicleCollection.find({ _id: { $in: myUser.vehicles } }).toArray();

        const vehicleFieldsToCheck = [
            "brand", "model", "year", "color", "plate", "serialNumber",
            "owner", "isActive", "dateAdded",
            "immatriculation.numeroCertificatImmatriculation",
            "immatriculation.dateDelivrance",
            "immatriculation.dateExpiration",
            "immatriculation.numeroEssieux",
            "immatriculation.masseNette",
            "immatriculation.cylindree",
            "immatriculation.numeroDossier",
            "immatriculation.categorieUsage"
        ];

        // Vérifier les champs manquants pour chaque véhicule
        const vehiclesWithMissingFields = vehicles.map(vehicle => ({
            vehicleId: vehicle._id, // Identifiant du véhicule
            missingFields: findMissingFields(vehicle, vehicleFieldsToCheck) // Champs manquants du véhicule
        })).filter(v => v.missingFields.length > 0); // Filtrer les véhicules avec des champs manquants

        if (vehiclesWithMissingFields.length > 0) {
            // Si des véhicules ont des champs manquants, renvoyer une erreur 400
            return res.status(400).json({ msg: "Missing required fields in vehicles", vehiclesWithMissingFields });
        }

        // Promesses pour obtenir les assurances et la licence de conduire
        const insurancesPromise = insuranceCollection.find({ vehicle: { $in: myUser.vehicles } }).toArray();
        const drivingLicensePromise = drivingLicensesCollection.findOne({ user: id });

        // Attendre que toutes les promesses se résolvent
        const [insurances, drivingLicense] = await Promise.all([insurancesPromise, drivingLicensePromise]);

        /* INSURANCE */

        // Filtrer les véhicules sans enregistrement d'assurance
        const vehiclesWithoutInsurance = vehicles.filter(vehicle =>
            !insurances.some(insurance => insurance.vehicle === vehicle._id)
        );

        // // Vérifier si des véhicules n'ont pas de certificat d'assurance
        if (vehiclesWithoutInsurance.length > 0) {
            // Si hay vehículos sin registros de seguro, retornar un error 400
            return res.status(400).json({ msg: `Véhicules sans assurance : (${vehiclesWithoutInsurance.length})`, vehiclesWithoutInsurance });
        }


        // Définir les champs à vérifier pour les assurances
        const insuranceFieldsToCheck = [
            "policyNumber", "insuranceCompany", "subscriber", "vehicle",
            "vehicleRegistrationNumber", "vehicleBrand", "vehicleModel",
            "vehicleYear", "expirationDate"
        ];

        // Filtrer les assurances avec des champs manquants
        const invalidInsurances = insurances.filter(insurance => findMissingFields(insurance, insuranceFieldsToCheck).length > 0);
        // Si des assurances ont des champs manquants, renvoyer une erreur 400
        if (invalidInsurances.length > 0) {
            return res.status(400).json({ msg: "Les champs suivants manquent dans l'assurance", invalidInsurances });
        }
        /* DRIVING LICENSE */

        // Si la licence de conduire n'est pas trouvée, renvoyer une erreur 400
        if (!drivingLicense) {
            return res.status(400).json({ msg: "Permis de conduire introuvable" });
        }
        // Définir les champs à vérifier pour la licence de conduire
        const drivingLicenseFieldsToCheck = [
            "number", "name", "lastName", "birthdate", "address", "appartment",
            "country", "province", "postalCode", "licenseClass", "sex", "rest",
            "mention", "height", "weight", "issued", "expires", "city"
        ];
        // Trouver les champs manquants pour la licence de conduire
        const missingDrivingLicenseFields = findMissingFields(drivingLicense, drivingLicenseFieldsToCheck);
        // Si des champs sont manquants dans la licence de conduire, renvoyer une erreur 400
        if (missingDrivingLicenseFields.length > 0) {
            return res.status(400).json({ msg: "Il manque les champs suivants sur le permis de conduire", missingDrivingLicenseFields });
        }

        // Mettre à jour le champ allFieldsComplete de l'utilisateur à true
        await userCollection.updateOne({ _id: id }, { $set: { allFieldsComplete: true } });

        // Préparer la réponse avec les informations complètes de l'utilisateur
        const response = {
            user: myUser, // Informations de l'utilisateur
            vehicles: vehicles.map(vehicle => ({
                vehicle,  // Informations du véhicule
                insurance: insurances.find(insurance => insurance.vehicle === vehicle._id.toString()) || null
            })),
            drivingLicense // Informations de la licence de conduire
        };

        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur de serveur interne", error: error.message });
    }
}

// Fonction auxiliaire pour trouver les champs manquants dans une entité donnée
function findMissingFields(entity, fieldsToCheck) {
    // Utiliser la méthode filter pour parcourir tous les champs à vérifier
    return fieldsToCheck.filter(field => {
        // Diviser le nom du champ par les points pour gérer les sous-champs imbriqués
        const fieldParts = field.split('.'); // Par exemple, "immatriculation.dateExpiration" devient ["immatriculation", "dateExpiration"]
        let value = entity; // Commencer par la valeur de l'entité de haut niveau

        // Boucle pour traverser les sous-champs un par un
        for (const part of fieldParts) {
            // Si la valeur actuelle est undefined, arrêter la boucle car le sous-champ n'existe pas
            if (value === undefined) break;
            // Mettre à jour la valeur avec le sous-champ actuel
            value = value[part];
        }
        // Vérifier si la valeur finale est null, une chaîne vide, ou "pending"
        return value == null || value === '' || value === 'pending';
    });
}


async function getUserSystemInfo(user) {
    try {

        // Obtenir les véhicules de l'utilisateur et leurs champs à vérifier
        const vehiclesPromise = await vehicleCollection.find({ _id: { $in: user.vehicles } }).toArray();
        const insurancesPromise = insuranceCollection.find({ vehicle: { $in: user.vehicles } }).toArray();
        const drivingLicensePromise = drivingLicensesCollection.findOne({ user: user._id });

        const [vehicles, insurances, drivingLicense] = await Promise.all([vehiclesPromise, insurancesPromise, drivingLicensePromise]);


        const response = {
            user: user, // Informations de l'utilisateur
            vehicles: vehicles.map(vehicle => ({
                vehicle,  // Informations du véhicule
                insurance: insurances.find(insurance => insurance.vehicle === vehicle._id.toString()) || null
            })),
            drivingLicense // Informations de la licence de conduire
        };


        return response;

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur de serveur interne", error: error.message });
    }
}


async function resendVerificationCode(req,body){
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
        await sendVerificationEmail(user.email, verificationCode);

        return res.status(200).json({ msg: "Un code de vérification a été envoyé à votre adresse électronique.", code: verificationCode });

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erreur de serveur interne", error: error.message });
    }
}


/**
 * Fonction pour télécharger et enregistrer l'image de profil de l'utilisateur.
 * 
 * @param {*} req Requête HTTP contenant le fichier image à télécharger.
 * @param {*} res Réponse HTTP pour renvoyer le résultat du téléchargement.
 * @returns Renvoie un message JSON avec le statut de l'opération.
 */
async function UploadUserProfileImage(req, res) {
    try {
        // Vérifie si le fichier a été correctement téléchargé
        if (!req.files || !req.files.image) {
            return res.status(400).json({ msg: "Aucun fichier n'a été téléchargé." });
        }

        // Vérifie si le token est fourni dans les en-têtes Authorization
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        // Décoder le token JWT pour obtenir l'ID de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous d'utiliser jwt.decode() correctement
        if (!myToken || !myToken.user_id) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const loggedInUserId = myToken.user_id;

        // Récupérez le fichier téléchargé à partir de req.files.image
        const uploadedImage = req.files.image;

        // Vérifie si uploadedImage est défini et contient un chemin temporaire
        if (!uploadedImage || !uploadedImage.path) {
            return res.status(400).json({ msg: "Le fichier téléchargé est invalide." });
        }

        // Vérifiez le type de fichier en fonction de l'extension
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = path.extname(uploadedImage.name).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ msg: "Le fichier téléchargé n'est pas une image valide." });
        }

        // Générez un nom de fichier unique pour éviter les collisions
        const uniqueFilename = `${loggedInUserId}_${Date.now()}${fileExtension}`;

        // Déplacez le fichier téléchargé vers le répertoire de destination
        const destinationPath = path.join(USER_ROUTER_IMG_PATH, uniqueFilename);

        // Déplacez le fichier temporaire vers le répertoire de destination
        fs.renameSync(uploadedImage.path, destinationPath);

        // Mettre à jour le chemin de l'image de profil dans la base de données
        await userCollection.updateOne({ "_id": loggedInUserId }, { $set: { profileImagePath: destinationPath } });

        // Retournez une réponse JSON réussie avec le chemin relatif de l'image enregistrée
        return res.status(200).json({ msg: "Image de profil téléchargée avec succès", imagePath: destinationPath });
    } catch (error) {
        console.error("Erreur lors du téléchargement de l'image de profil:", error);
        return res.status(500).json({ msg: "Erreur lors du téléchargement de l'image de profil", error: error.message });
    }
}


/**
 * Fonction pour supprimer l'image de profil de l'utilisateur.
 * 
 * Cette fonction traite la requête de suppression de l'image de profil d'un utilisateur. Elle vérifie le token JWT pour identifier l'utilisateur,
 * supprime le fichier d'image de profil du système de fichiers, et met à jour le champ `profileImagePath` de l'utilisateur dans la base de données.
 * 
 * @param {*} req - La requête HTTP contenant le token JWT dans les en-têtes Authorization.
 * @param {*} res - La réponse HTTP pour renvoyer le résultat de la suppression.
 * @returns Renvoie une réponse JSON avec le statut de l'opération.
 */
async function DeleteUserProfileImage(req, res) {
    try {
        // Vérifie si le token est fourni dans les en-têtes Authorization
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        // Décoder le token JWT pour obtenir l'ID de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous d'utiliser jwt.decode() correctement
        if (!myToken || !myToken.user_id) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const loggedInUserId = myToken.user_id;

        // Rechercher l'utilisateur dans la base de données
        const loggedInUser = await userCollection.findOne({ "_id": loggedInUserId });
        if (!loggedInUser) {
            return res.status(403).json({ msg: "Utilisateur non trouvé" });
        }

        // Chemin de l'image de profil actuelle
        const profileImagePath = loggedInUser.profileImagePath;
        if (!profileImagePath || profileImagePath === '') {
            return res.status(400).json({ msg: "Aucune image de profil à supprimer" });
        }

        // Supprimer le fichier d'image de profil du système de fichiers
        fs.unlink(profileImagePath, (err) => {
            if (err) {
                console.error("Erreur lors de la suppression de l'image de profil:", err);
                return res.status(500).json({ msg: "Erreur lors de la suppression de l'image de profil", error: err.message });
            }
        });

        // Mettre à jour le champ profileImagePath de l'utilisateur dans la base de données
        await userCollection.updateOne({ "_id": loggedInUserId }, { $set: { profileImagePath: '' } });

        // Retourner une réponse JSON réussie
        return res.status(200).json({ msg: "Image de profil supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image de profil:", error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
    }
}


module.exports = {
    RegisterUser,
    Login,
    LoginWithToken,
    UploadUserProfileImage,
    DeleteUserProfileImage,
    Logout,
    RefresLogin,
    GetUserById,
    RestorePassword,
    EditUser,
    SendVerificationCode,
    verifyAndChangePassword,
    DeleteUser,
    UploadDocument,
    // UploadDriverLicense,
    generateQRCode,
    readAndSendUserInfo,
    encryptMyData,
    getMyAutoFullInfo,
    getUserInfo,
    validateInscription,
    RegisterUserSendCode,
    RegisterUserVerifyCode,
    resendVerificationCode
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



