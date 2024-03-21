const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const vehicleController = require('../../controllers/vehicle/vehicle.controller.js');
// VARIABLES
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadUserImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_PATH}` });



// Route pour ajouter une voiture
router.post('/add', [userAuth.ensureAuth], vehicleController.addCar);

// Route pour obtenir une voiture par son ID
router.get('/:id', [userAuth.ensureAuth], vehicleController.getCarById);

// Route pour modifier une voiture par son ID
router.put('/:id', [userAuth.ensureAuth], vehicleController.editCar);

// Route pour supprimer une voiture par son ID
router.delete('/delete/:id', [userAuth.ensureAuth], vehicleController.deleteCarById);

// Route pour obtenir toutes les voitures d'un utilisateur connecté
router.get('/', [userAuth.ensureAuth], vehicleController.getAllCars);

// Route pour activer ou désactiver une voiture par son ID
router.put('/toggle-activation/:id', [userAuth.ensureAuth], vehicleController.toggleCarActivation);



module.exports = router;
