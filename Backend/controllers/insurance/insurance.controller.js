const { getDb } = require('../../mongoConnection');
const jwt = require('../../utils/jwt');
const { body, validationResult } = require('express-validator');
const Insurance = require('../../models/insurance/insurance');
const { myCache, encryptData, decryptData } = require("../../utils/cache");

const MAINDB = process.env.MAINDB;
const INSURANCES_COLLECTION = process.env.INSURANCES_COLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLES_COLLECTION;

const mainDb = getDb(MAINDB);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

async function validateInsuranceFields(req) {
    await Promise.all([
        body('insuranceNumber').notEmpty().withMessage('Le numéro d\'assurance est requis').run(req),
        body('insuranceCompany').notEmpty().withMessage('La compagnie d\'assurance est requise').run(req),
        body('subscriber').notEmpty().withMessage('Le souscripteur est requis').run(req),
        body('vehicle').notEmpty().withMessage('Le véhicule est requis').run(req)
        // Vous pouvez ajouter plus de validations selon les champs de votre modèle d'assurance
    ]);
}