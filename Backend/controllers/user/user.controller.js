// // Importations nécessaires
// const { getDb } = require('../mongoConnection');
// const bcrypt = require('bcryptjs');
// const jwt = require('../utils/jwt');
// const Tenant = require('../modeles/Tenants');
// //const imageCache = new NodeCache(); //instance de cache pour stocker les images
// const { body, validationResult } = require('express-validator'); 

// // DOCS PATHs AND NAMES
// const fs = require('fs');
// const path = require('path'); 
// const { myCache, encryptData, decryptData } = require("../utils/cache");
// const filePath = require("../utils/filePath");


// const PATH_IMG_TENANT = process.env.TENANT_IMG_PATH;  
// const AES_KEY = process.env.AES_KEY;
// const TENANTS_COLLECTION = process.env.TENANTS_COLLECTION;
// const PROPERTIES_COLLECTION = process.env.PROPERTIES_COLLECTION;
// const OWNERS_COLLECTION = process.env.OWNERS_COLLECTION;
// const UNITS_COLLECTION = process.env.UNITS_COLLECTION;
// const STARTH_DB = process.env.SH_MAIN_DB;

async function createUser(req, res) {

    console.log("hello wolrd from createUser");

}




module.exports = {

    createUser,
};




