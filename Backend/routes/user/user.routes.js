const { Router } = require("express");
const router = Router();

const userController = require ('../../controllers/user/user.controller.js');


router.post('/user/register', userController.registerUser);




module.exports = router;