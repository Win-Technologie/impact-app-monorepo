const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
// const userController = require('../../controllers/user/user.controller.js');
const driverLicenseController = require('../../controllers/driverLicense/driverLicense.controller.js')
// VARIABLES
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;
const DOCS_ROUTER_IMG_PATH = process.env.DOCS_ROUTER_DOC_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadUserImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_PATH}` });
const md_uploadUserDocs = multiparty({uploadDir: `${DOCS_ROUTER_IMG_PATH}`});


/* DRIVER LICENCE ENDPOINTS */
// To upload driver licence
// router.post('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserDocs],
//     driverLicenseController.UploadDriverLicense
// );
router.post('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession],
    driverLicenseController.UploadDriverLicense
);

// GET MY DRIVING LICENSE
router.get('/user/me', [userAuth.ensureAuth, userAuth.isActiveSession], driverLicenseController.GetMyLicense);
// GET DRIVING LICENSE BY ID
router.get('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession], driverLicenseController.GetDrivingLicense);
// DELETE DRIVING LICENSE
router.delete('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession], driverLicenseController.DeleteDrivingLicense);

module.exports = router;