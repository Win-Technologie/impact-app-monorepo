const { Router } = require("express");
const router = Router();
// MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js');
// CONTROLLERS
const onfidoController = require('../../controllers/onfido/onfido.controller.js');
// VARIABLES
const ONFIDO_ROUTER_IMG_PATH = process.env.ONFIDO_ROUTER_IMG_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadUserImg = multiparty({ uploadDir: `${ONFIDO_ROUTER_IMG_PATH}` });

// Route pour ajouter un demandeur Onfido
router.post('/applicants', [userAuth.ensureAuth], onfidoController.createApplicant);

// Route pour obtenir un demandeur Onfido par son email
router.get('/applicants/:email', [userAuth.ensureAuth], onfidoController.getApplicantByEmail);

// Route pour supprimer un demandeur Onfido par son email
router.delete('/applicants/:email', [userAuth.ensureAuth], onfidoController.deleteApplicantByEmail);

// Route pour récupérer tous les demandeurs Onfido
router.get('/applicants', [userAuth.ensureAuth], onfidoController.getAllApplicants);

// Route pour vérifier le permis de conduire d'un demandeur Onfido
router.post('/applicants/driving_license', onfidoController.verifyDrivingLicense);





module.exports = router;
