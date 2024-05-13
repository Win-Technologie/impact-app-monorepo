const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const accidentController = require('../../controllers/accidentReport/accidentReport.controller.js');
// VARIABLES
const ACCIDENT_IMG_PATH = process.env.ACCIDENT_IMG_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadAccidentImg = multiparty({ uploadDir: `${ACCIDENT_IMG_PATH}` });



// Route pour ajouter une voiture
router.patch('/report/new', [userAuth.ensureAuth, md_uploadAccidentImg], accidentController.newAccidentReport);

// Route pour obtenir une voiture par son ID
router.get('/report/:id', [userAuth.ensureAuth], accidentController.getAccidentReport);

// Route pour modifier une voiture par son ID
router.patch('/update/:id', [userAuth.ensureAuth], accidentController.updateAccidentReport);


module.exports = router;
