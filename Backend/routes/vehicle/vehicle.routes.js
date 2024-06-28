/**
 * Fichier de routage pour la gestion des véhicules.
 * Ce fichier définit les routes pour les opérations liées aux véhicules,
 * telles que l'ajout, la modification, la suppression et la récupération des véhicules.
 * Il utilise le middleware d'authentification JWT.
 */

const { Router } = require("express");
const router = Router();

// MIDDLEWARES
// Importation du middleware d'authentification JWT
const userAuth = require('../../auth/jwt.authenticated.js');

// CONTROLLERS
// Importation des contrôleurs pour la gestion des véhicules
const vehicleController = require('../../controllers/vehicle/vehicle.controller.js');

// VARIABLES
// Chemin pour la sauvegarde des images des véhicules
const CARS_ROUTER_IMG_PATH = process.env.CARS_ROUTER_IMG_PATH;

// ADMIN FILES AND IMAGES
// Importation du middleware pour la gestion des fichiers multipart/form-data
const multiparty = require('connect-multiparty');

// IMAGES PATH
// Configuration du middleware pour l'upload des images de véhicules
const md_uploadUserImg = multiparty({ uploadDir: `${CARS_ROUTER_IMG_PATH}` });

// Route pour ajouter un nouveau véhicule
// Utilise le middleware d'authentification
router.post('/add', [userAuth.ensureAuth], vehicleController.addCar);

// Route pour obtenir un véhicule par son ID
// Utilise le middleware d'authentification
router.get('/:id', [userAuth.ensureAuth], vehicleController.getCarById);

// Route pour modifier un véhicule par son ID
// Utilise le middleware d'authentification
router.put('/:id', [userAuth.ensureAuth], vehicleController.editCar);

// Route pour supprimer un véhicule par son ID
// Utilise le middleware d'authentification
router.delete('/delete/:id', [userAuth.ensureAuth], vehicleController.deleteCarById);

// Route pour obtenir tous les véhicules d'un utilisateur connecté
// Utilise le middleware d'authentification
router.get('/', [userAuth.ensureAuth], vehicleController.getAllCars);

// Route pour activer ou désactiver un véhicule par son ID
// Utilise le middleware d'authentification
router.put('/toggle-activation/:id', [userAuth.ensureAuth], vehicleController.toggleCarActivation);

// Route pour modifier une immatriculation par l'ID de son véhicule
// Utilise le middleware d'authentification
router.put('/immatriculation/:id', [userAuth.ensureAuth], vehicleController.updateImmatriculation);

module.exports = router;
