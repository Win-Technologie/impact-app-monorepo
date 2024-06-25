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







/**
 * @swagger
 *  /api/users/user/register/code:
 *      post:
 *          summary: Enregistrement d'un utlisateur
 *          tags:
 *              - Users
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  required: true
 *                              password:
 *                                  type: string
 *                                  required: true
 *                          example:
 *                              email: "onanajunior92@gmail.com"
 *                              password: "Oojj1992*"
 *          responses:
 *              '201':
 *                description: >
 *                    Utlisateur crée avec succès
 *              '400':
 *                description: >
 *                    Utlisateur existe dejà
 *              '500':
 *                  description: >
 *                    Erreur interne du serveur
 *
 */
router.post('/user/register/code', userController.RegisterUserSendCode);






/**
 * @swagger
 *  /api/users/user/register/verify:
 *      post:
 *          summary: Vérifie le code de validation de l'adresse email
 *          tags:
 *              - Users
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  required: true
 *                              verificationCode:
 *                                  type: string
 *                                  required: true
 *                          example:
 *                              email: "onanajunior92@gmail.com"
 *                              verificationCode: "995843"
 *          responses:
 *              '201':
 *                description: >
 *                    Utlisateur crée avec succès
 *              '400':
 *                description: >
 *                    Utlisateur existe dejà
 *              '500':
 *                  description: >
 *                    Erreur interne du serveur
 *
 */
router.post('/user/register/verify', userController.RegisterUserVerifyCode);


/**
 * @swagger
 *  /api/users/user:
 *      delete:
 *          summary: Supprime un utlisateur de la bd
 *          tags:
 *              - Users
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: query
 *                name: id
 *                schema:
 *                  type: string
 *                  required: false
 *                description: User Id
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  required: true
 *                              password:
 *                          example:
 *                              email: "onanajunior92@gmail.com"
 *          responses:
 *              '201':
 *                description: >
 *                    Utlisateur crée avec succès
 *              '400':
 *                description: >
 *                    Utlisateur existe dejà
 *              '500':
 *                  description: >
 *                    Erreur interne du serveur
 *
 */
router.delete('/user', userController.DeleteUser);



/**
 * @swagger
 *  /api/users/user/login:
 *      post:
 *          summary: Connecte un utilisteur
 *          tags:
 *              - Users
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  required: true
 *                              password:
 *                                  type: string
 *                                  required: true 
 *                          example:
 *                              email: "onanajunior92@gmail.com"
 *                              password: "Oojj1992*"
 *          responses:
 *              '200':
 *                description: >
 *                    Delivery address successfully deleted
 *              '404':
 *                description: >
 *                    User not found || Delivery address not found
 *              '500':
 *                  description: >
 *                    Server Error || An error has occured, please try again later
 *
 */
router.post('/user/login', userController.Login);



//router.post('/user/register', userController.RegisterUser);

//router.post('/user/register/code', userController.RegisterUserSendCode);
// To verify verification code of register.
//router.post('/user/register/verify', userController.RegisterUserVerifyCode);

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