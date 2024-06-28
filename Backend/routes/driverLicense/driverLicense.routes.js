/**
 * Fichier de routage pour la gestion des licences de conduire.
 * Ce fichier définit les routes pour créer, obtenir et supprimer des licences de conduire.
 * Il utilise les middlewares d'authentification et de gestion des fichiers multipart/form-data.
 */

const { Router } = require("express");
const router = Router();

// MIDDLEWARES
// Middleware d'authentification JWT
const userAuth = require('../../auth/jwt.authenticated.js');

// CONTROLLERS
// Contrôleur pour la gestion des licences de conduire
const driverLicenseController = require('../../controllers/driverLicense/driverLicense.controller.js');

// VARIABLES
// Chemins pour la sauvegarde des images utilisateur et des documents
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;
const DOCS_ROUTER_IMG_PATH = process.env.DOCS_ROUTER_DOC_PATH;

// ADMIN FILES AND IMAGES
// Middleware pour la gestion des fichiers multipart/form-data
const multiparty = require('connect-multiparty');

// IMAGES PATH
// Configuration des middlewares pour l'upload des images utilisateur et des documents
const md_uploadUserImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_PATH}` });
const md_uploadUserDocs = multiparty({ uploadDir: `${DOCS_ROUTER_IMG_PATH}` });

// Route pour créer une licence de conduire
// Utilise le middleware d'authentification pour s'assurer que l'utilisateur est authentifié
router.post('/user/license', userAuth.ensureAuth, driverLicenseController.createDrivingLicence);

// Route pour obtenir les informations de sa propre licence de conduire
// Utilise les middlewares d'authentification et de vérification de session active
router.get('/user/me', [userAuth.ensureAuth, userAuth.isActiveSession], driverLicenseController.GetMyLicense);

// Route pour obtenir une licence de conduire par ID
// Utilise les middlewares d'authentification et de vérification de session active
router.get('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession], driverLicenseController.GetDrivingLicense);

// Route pour supprimer une licence de conduire
// Utilise les middlewares d'authentification et de vérification de session active
router.delete('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession], driverLicenseController.DeleteDrivingLicense);

module.exports = router;
