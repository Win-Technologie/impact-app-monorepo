/**
 * Fichier de routage pour la gestion des assurances.
 * Ce fichier définit les routes pour ajouter, obtenir, modifier, supprimer et lister les assurances.
 * Il utilise les middlewares d'authentification et de gestion des fichiers multipart/form-data.
 */

const { Router } = require("express");
const router = Router();

// MIDDLEWARES
// Importation du middleware d'authentification JWT
const userAuth = require('../../auth/jwt.authenticated.js');

// CONTROLLERS
// Importation des contrôleurs pour la gestion des assurances
const insuranceController = require('../../controllers/insurance/insurance.controller.js');

// VARIABLES
// Chemin pour la sauvegarde des images d'assurance
const INSURANCE_ROUTER_IMG_PATH = process.env.INSURANCE_ROUTER_IMG_PATH;

// ADMIN FILES AND IMAGES
// Importation du middleware pour la gestion des fichiers multipart/form-data
const multiparty = require('connect-multiparty');

// IMAGES PATH
// Configuration du middleware pour l'upload des images d'assurance
const md_uploadInsuranceImg = multiparty({ uploadDir: `${INSURANCE_ROUTER_IMG_PATH}` });

// Route pour ajouter une assurance à un véhicule par son ID
// Utilise le middleware d'authentification
router.post('/add/:vehicleId', [userAuth.ensureAuth], insuranceController.addInsurance);

// Route pour obtenir une assurance par son ID
// Utilise le middleware d'authentification
router.get('/:id', [userAuth.ensureAuth], insuranceController.getInsuranceById);

// Route pour modifier une assurance par son ID
// Utilise le middleware d'authentification
router.patch('/:id', [userAuth.ensureAuth], insuranceController.editInsurance);

// Route pour supprimer une assurance par son ID
// Utilise le middleware d'authentification
router.delete('/delete/:id', [userAuth.ensureAuth], insuranceController.deleteInsurance);

// Route pour obtenir toutes les assurances d'un véhicule par son ID
// Utilise le middleware d'authentification
router.get('/vehicle/:vehicleId', [userAuth.ensureAuth], insuranceController.getInsuranceByVehicleId);

// Route pour obtenir toutes les assurances d'un utilisateur par son ID
// Utilise le middleware d'authentification
router.get('/user/:userId', [userAuth.ensureAuth], insuranceController.getInsuranceByUserId);

module.exports = router;
