// // Importations nécessaires
const { getDb } = require('../../mongoConnection');
const bcrypt = require('bcryptjs');
const jwt = require('../../utils/jwt');
// const Tenant = require('../modeles/Tenants');
// //const imageCache = new NodeCache(); //instance de cache pour stocker les images
const { body, validationResult } = require('express-validator');

// // DOCS PATHs AND NAMES
// const fs = require('fs');
// const path = require('path'); 
// const { myCache, encryptData, decryptData } = require("../utils/cache");
// const filePath = require("../utils/filePath");

// MODELS
const User = require('../../modeles/users/user');
// VARIABLES
const VARS = require('../../../vars');

async function validateRegisterOwnerFields(req) {
    // Validation de l'email
    await body('email')
        .isEmail().withMessage('L\'adresse e-mail est requise et doit être valide')
        .matches(/^.+@.+\..+$/).withMessage('L\'adresse e-mail est invalide, l\'arobase (@) est manquante').run(req);
    // Validation du nom
    await body('name').notEmpty().isLength({ min: 2 }).withMessage('Le nom est requis et doit contenir au moins 2 caractères.').run(req);

    // Validation du nom
    await body('lastName').notEmpty().isLength({ min: 2 }).withMessage('le nom de famille est requis et doit contenir au moins 2 caractères.').run(req);

    // Validation du mot de passe
    await body('password').isLength({ min: 8 }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Le mot de passe est requis et doit contenir au moins 8 caractères').run(req);
    //await body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre').run(req);

    // Validation du numéro de téléphone
    await body('phone').isNumeric().isLength({ min: 10 }).withMessage('Le numéro de téléphone est requis et doit être numérique').run(req);

    // Validation de l'adresse
    await body('address').isLength({ min: 4 }).withMessage('L\'adresse est requise et doit avoir au moins 4 caractères').run(req);

    // Validation de postal code
    await body('postalCode').isLength({ min: 4 }).withMessage('Le code postal est requis et doit contenir au moins 4 caractères.').run(req);

    // Validation de province
    await body('province').isLength({ min: 4 }).withMessage('La province est requis et doit contenir au moins 4 caractères.').run(req);

    // Validation de ville
    await body('city').isLength({ min: 4 }).withMessage('La ville est requis et doit contenir au moins 4 caractères.').run(req);

    // Validation de ville
    await body('country').isLength({ min: 4 }).withMessage('Le pays est requis et doit contenir au moins 4 caractères.').run(req);

    // Validation de genre
    await body('gender').isLength({ min: 4 }).withMessage('Le genre est requis et doit contenir au moins 4 caractères.').run(req);
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
    await body('birthDay').notEmpty().withMessage('La date est requise et doit être du type date').run(req);
}

async function RegisterUser(req, res) {
    try {
        const { email, name, lastName, password, phone, address, postalCode,
            province, city, country, gender, birthDay, companyName
        } = req.body;

        const emailLowerCase = email.toLowerCase();

        // Validation des champs de la requête
        await validateRegisterOwnerFields(req);
        // Vérification des erreurs de validation
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }
        // Initialiser la connexion à la base de données et définir la collection des utilisateurs
        const mainDb = getDb(VARS.MAINDB);
        const userCollection = mainDb.collection(VARS.USERSCOLLECTION);

        // Vérifier si l'utilisateur existe déjà
        let userExisting = await userCollection.findOne({ email: emailLowerCase });

        if (userExisting) {
            return res.status(400).json({ msg: "Ce courriel est déjà utilisé" });
        }

        // Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUSer = new User({
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
       /// Sauvegarde du nouveau propriétaire dans la collection 'users'
        const insertResult = await userCollection.insertOne(newUSer);

        if (!insertResult.acknowledged) {
            return res.status(500).json({ msg: "Erreur lors de l'ajout d'un nouvel utilisateur" });
        }

        res.status(201).json({ msg: "Utilisateur créé avec succès", newuser: newUSer });

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

        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        // On convertit l'adresse e-mail en minuscules pour assurer une recherche insensible à la casse
        const emailLowerCase = email.toLowerCase();

        const mainDb = getDb(VARS.MAINDB);
        const userCollection = mainDb.collection(VARS.USERSCOLLECTION);

        const loggedInUser = await userCollection.findOne({ "email": emailLowerCase });

        if (!loggedInUser) {
            return res.status(403).json({ msg: "user not found" });
        }

        if (loggedInUser.active) {
            token = jwt.createAccessToken(loggedInUser);
            const passwordMatch = await bcrypt.compare(password, loggedInUser.password);

            if (passwordMatch) {
                return res.status(200).json({ msg: "Utilisateur authentifié avec succès", A7: token, user: loggedInUser._id });
            } else {
                return res.status(401).json({ msg: "Mot de passe incorrect" });
            }

        } else {
            res.status(401).json({ msg: "Compte inactif." });
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
        const decodedToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!decodedToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        // const userEmail = decodedToken.user_email; // Assurez-vous que le token contient bien l'email
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



module.exports = {

    RegisterUser,
    Login,
    Logout
};




