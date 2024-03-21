const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const vehicleController = require('../../controllers/vehicle/vehicle.controller.js');

// Route pour rechercher des voitures par marque, modèle ou couleur
router.get('/search', vehicleController.searchCars);

// Route pour ajouter une voiture
router.post('/add', vehicleController.addCar);

// Route pour obtenir une voiture par son ID
router.get('/:id', vehicleController.getCarById);

// Route pour modifier une voiture par son ID
router.put('/:id', vehicleController.editCar);

// Route pour supprimer une voiture par son ID
router.delete('/delete/:id', vehicleController.deleteCarById);

// Route pour obtenir toutes les voitures d'un utilisateur connecté
router.get('/', vehicleController.getAllCars);

// Route pour activer ou désactiver une voiture par son ID
router.put('/toggle-activation/:id', vehicleController.toggleCarActivation);



module.exports = router;
