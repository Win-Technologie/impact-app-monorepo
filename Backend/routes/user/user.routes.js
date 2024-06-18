const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const userController = require('../../controllers/user/user.controller.js');
const driverLicenseController = require('../../controllers/driverLicense/driverLicense.controller.js');
// VARIABLES
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;
// const DOCS_ROUTER_IMG_PATH = process.env.DOCS_ROUTER_DOC_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadUserImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_PATH}` });
// const md_uploadUserDocs = multiparty({uploadDir: `${DOCS_ROUTER_IMG_PATH}`});


// Route to authenticate a user using a JWT token
router.post('/user/login/token', userAuth.ensureAuth, userController.LoginWithToken);

// To register new users.
router.post('/user/register', userController.RegisterUser);

router.post('/user/register/code', userController.RegisterUserSendCode);
// To verify verification code of register.
router.post('/user/register/verify', userController.RegisterUserVerifyCode);

// For users to log in.
router.post('/user/login', userController.Login);
// router.post('/user/login', [userAuth.isCompletedUser], userController.Login);
//  For users to log out.
router.post('/user/logout', [userAuth.ensureAuth], userController.Logout);
// For users to refresh them session (new token).
router.post('/user/refresh', [userAuth.ensureAuth, userAuth.isActiveSession], userController.RefresLogin);
// To obtain the authenticated user profile.
router.get('/user/profile/:id', [userAuth.ensureAuth, userAuth.isActiveSession], userController.GetUserById);
// To restore users's password
router.post('/user/password/reset', [userAuth.ensureAuth, userAuth.isActiveSession], userController.RestorePassword);
// To edit usrs's information
router.patch('/user', [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserImg], userController.EditUser);
// TWO STEP PASSWORD RECOVERY
// To send a verification code for recover password account
// router.post('/user/password/code', [userAuth.isActiveSession], userController.SendVerificationCode);
router.post('/user/password/code', userController.SendVerificationCode);
// To verify the code already sent and recover password account
// router.post('/user/password/verify', [userAuth.isActiveSession], userController.verifyAndChangePassword);
router.post('/user/password/verify', userController.verifyAndChangePassword);
//To delete an user from DB
router.delete('/user/:id?', [userAuth.ensureAuth, userAuth.isActiveSession], userController.DeleteUser);
// To upload Documents
// router.post('/user/uploads', [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserDocs],
//     userController.UploadDocument
// );

/* CODE QR USER INFO ENDPOINTS */

// To generate QR code
router.post('/code/generate', [userAuth.ensureAuth, userAuth.isActiveSession],
    userController.generateQRCode
);

// To get id user and send all user info
router.post('/code/read', [userAuth.ensureAuth, userAuth.isActiveSession],
    userController.readAndSendUserInfo
);

// Resend a code
router.post('/code/resend', [userAuth.ensureAuth, userAuth.isActiveSession],
    userController.resendVerificationCode
);


/* ENCRYPT DATA TESTING ENDPOINTS */

//test security encrypted data
router.post('/test/data/encrypt', [userAuth.ensureAuth, userAuth.isActiveSession],
    userController.encryptMyData
);

//get user's full data (auto, assurance)
router.get('/user/vehicle/info/:vehicleId', [userAuth.ensureAuth, userAuth.isActiveSession],
    userController.getMyAutoFullInfo
);

router.post('/user/validate/:id?', [userAuth.ensureAuth, userAuth.isActiveSession],
    userController.validateInscription
);



// /* DRIVER LICENCE ENDPOINTS */
// // To upload driver licence
// router.post('/user/license', [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserDocs],
//     userController.UploadDriverLicense
// );

module.exports = router;