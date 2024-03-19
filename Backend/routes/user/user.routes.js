const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const userController = require('../../controllers/user/user.controller.js');
// MULTER
// const { avatarUpload, carImageUpload } = require('../../utils/multer.js');
// const multer  = require('multer')
// const uploadUserPhotos = multer({ dest: 'uploads/users/photos' })
// const uploadAvatar = uploadUserPhotos.fields([{ name: 'avatar', maxCount: 5 }, { name: 'gallery', maxCount: 8 }])


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
// router.patch('/user/:id', [userAuth.ensureAuth, userAuth.isActiveSession, avatarUpload], userController.EditUser);
// router.patch('/user/:id', [userAuth.ensureAuth, userAuth.isActiveSession,
//     uploadAvatar
// ], userController.EditUser);


module.exports = router;