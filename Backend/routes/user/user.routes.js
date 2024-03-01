const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const userController = require ('../../controllers/user/user.controller.js');


router.post('/user/register', userController.RegisterUser);
router.post('/user/login', userController.Login);
router.post('/user/logout', [userAuth.ensureAuth], userController.Logout);
router.post('/user/refresh', [userAuth.ensureAuth], userController.RefresLogin);




module.exports = router;