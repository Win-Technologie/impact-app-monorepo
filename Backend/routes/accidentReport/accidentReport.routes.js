/**
 * Fichier de routage pour la gestion des rapports d'accidents.
 * Ce fichier définit les routes pour créer, obtenir, modifier, rejoindre et lister les rapports d'accidents.
 * Il utilise les middlewares d'authentification et de gestion des fichiers multipart/form-data.
 */

const { Router } = require("express");
const router = Router();

// MIDDLEWARES
// Importation du middleware d'authentification JWT
const userAuth = require('../../auth/jwt.authenticated.js');

// CONTROLLERS
// Importation des contrôleurs pour la gestion des rapports d'accident
const accidentController = require('../../controllers/accidentReport/accidentReport.controller.js');

// VARIABLES
// Chemins pour la sauvegarde des images et des rapports d'accidents
const ACCIDENT_IMG_PATH = process.env.ACCIDENT_IMG_PATH;
const USER_ROUTER_IMG_ACCIDENT_REPPORT_PATH = process.env.USER_ROUTER_IMG_ACCIDENT_REPPORT_PATH;

// ADMIN FILES AND IMAGES
// Importation du middleware pour la gestion des fichiers multipart/form-data
const multiparty = require('connect-multiparty');

// IMAGES PATH
// Configuration des middlewares pour l'upload des images
const md_uploadAccidentImg = multiparty({ uploadDir: `${ACCIDENT_IMG_PATH}` });
const md_uploadAccidentRepportImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_ACCIDENT_REPPORT_PATH}` });

// Route pour ajouter un nouveau rapport d'accident
// Utilise les middlewares d'authentification et de gestion des fichiers pour les images de rapports d'accidents
router.post('/report/new', [userAuth.ensureAuth, md_uploadAccidentRepportImg], accidentController.newAccidentReport);

// Route pour obtenir un rapport d'accident par son ID
// Utilise le middleware d'authentification
router.get('/report/:id', [userAuth.ensureAuth], accidentController.getAccidentReport);

// Route pour modifier un rapport d'accident par son ID
// Utilise les middlewares d'authentification et de gestion des fichiers pour les images d'accidents
router.patch('/update/:accidentId', [userAuth.ensureAuth, md_uploadAccidentImg], accidentController.updateAccidentReport);

// Route pour rejoindre un rapport d'accident existant
// Utilise le middleware d'authentification
router.post('/report/join', [userAuth.ensureAuth], accidentController.joinToAccidentReport);

// Route pour obtenir tous les rapports d'accidents d'un utilisateur
// Utilise le middleware d'authentification
router.get('/accidentReports', [userAuth.ensureAuth], accidentController.getUserAccidentReports);

// Route pour obtenir les détails des accidents historiques d'un utilisateur
// Utilise le middleware d'authentification
router.get('/accidentDetails', [userAuth.ensureAuth], accidentController.getUserAccidentDetails);

module.exports = router;
