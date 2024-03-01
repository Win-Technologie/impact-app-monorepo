const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const userController = require ('../../controllers/user/user.controller.js');

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




module.exports = router;