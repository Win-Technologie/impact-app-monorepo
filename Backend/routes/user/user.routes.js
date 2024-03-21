const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const userController = require('../../controllers/user/user.controller.js');
// VARIABLES
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;
const DOCS_ROUTER_IMG_PATH = process.env.DOCS_ROUTER_DOC_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadUserImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_PATH}` });
const md_uploadUserDocs = multiparty({uploadDir: `${DOCS_ROUTER_IMG_PATH}`});

// To register new users.
router.post('/user/register', userController.RegisterUser);
// For users to log in.
router.post('/user/login', userController.Login);
//  For users to log out.
router.post('/user/logout', [userAuth.ensureAuth], userController.Logout);
// For users to refresh them session (new token).
router.post('/user/refresh', [userAuth.ensureAuth, userAuth.isActiveSession], userController.RefresLogin);
// To obtain the authenticated user profile.
router.get('/user/profile/:id', [userAuth.ensureAuth, userAuth.isActiveSession], userController.GetUserById);
// To restore users's password
router.post('/user/password/reset', [userAuth.ensureAuth, userAuth.isActiveSession], userController.RestorePassword);
// To edit usrs's information
router.patch('/user/:id', [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserImg], userController.EditUser);
// TWO STEP PASSWORD RECOVERY
// To send a verification code for recover password account
// router.post('/user/password/code', [userAuth.isActiveSession], userController.SendVerificationCode);
router.post('/user/password/code', userController.SendVerificationCode);
// To verify the code already sent and recover password account
// router.post('/user/password/verify', [userAuth.isActiveSession], userController.verifyAndChangePassword);
router.post('/user/password/verify', userController.verifyAndChangePassword);
//To delete an user from DB
router.delete('/user/:id', [userAuth.ensureAuth, userAuth.isActiveSession], userController.DeleteUser);

router.post('/user/uploads', [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserDocs],
    userController.UploadDocument
)

module.exports = router;