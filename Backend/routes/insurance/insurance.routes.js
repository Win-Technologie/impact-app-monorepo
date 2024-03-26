const { Router } = require("express");
const router = Router();
// MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
// CONTROLLERS
const insuranceController = require('../../controllers/insurance/insurance.controller.js');
// VARIABLES
const INSURANCE_ROUTER_IMG_PATH = process.env.INSURANCE_ROUTER_IMG_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadInsuranceImg = multiparty({ uploadDir: `${INSURANCE_ROUTER_IMG_PATH}` });

// Route pour ajouter une assurance
router.post('/add', [userAuth.ensureAuth], insuranceController.addInsurance);

// Route pour obtenir une assurance par son ID
router.get('/:id', [userAuth.ensureAuth], insuranceController.getInsuranceById);

// Route pour modifier une assurance par son ID
router.patch('/:id', [userAuth.ensureAuth], insuranceController.editInsurance);

// Route pour supprimer une assurance par son ID
router.delete('/delete/:id', [userAuth.ensureAuth], insuranceController.deleteInsurance);


module.exports = router;
