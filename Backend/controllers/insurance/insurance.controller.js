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

async function addInsurance(req, res) {
    try {
        // Similar JWT and validation handling as addCar
        await validateInsuranceFields(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            return res.status(400).json({ error: errorMessage });
        }

        // Assuming you have decoded the JWT to get userId
        const { insuranceNumber, insuranceCompany, subscriber, vehicle } = req.body;

        // Check for existing insurance with the same insuranceNumber
        const existingInsurance = await insuranceCollection.findOne({ insuranceNumber });
        if (existingInsurance) {
            return res.status(400).json({ message: "Une assurance avec ce numéro existe déjà." });
        }

        const newInsurance = new Insurance({
            insuranceNumber,
            insuranceCompany,
            subscriber,
            vehicle
            // Ajoutez d'autres champs ici selon le besoin
        });

        // Insert the new insurance document
        await insuranceCollection.insertOne(newInsurance);
        // Optionally, update the vehicle document or other related documents

        return res.status(201).json({ message: 'Assurance ajoutée avec succès', insurance: newInsurance });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'assurance :", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}

module.exports = {
    addInsurance
};
