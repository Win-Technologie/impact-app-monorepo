const { getDb } = require('../../mongoConnection');
const jwt = require('../../utils/jwt');
const { body, validationResult } = require('express-validator');
const Insurance = require('../../modeles/insurance/insurance');
const { myCache, encryptData, decryptData } = require("../../utils/cache");

const MAINDB = process.env.MAINDB;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;

const mainDb = getDb(MAINDB);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

async function validateInsuranceFields(req) {
    await Promise.all([
        body('insuranceNumber').notEmpty().withMessage('Le numéro d\'assurance est requis').run(req),
        body('insuranceCompany').notEmpty().withMessage('La compagnie d\'assurance est requise').run(req),
        body('vehicle').notEmpty().withMessage('Le véhicule est requis').run(req)
        // Vous pouvez ajouter plus de validations selon les champs de votre modèle d'assurance
    ]);
}


// FONCTIONNEL | Manque le cache 
async function addInsurance(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const subscriber = myToken.user_id;
        console.log("Subscriber", subscriber);

        await validateInsuranceFields(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            return res.status(400).json({ error: errorMessage });
        }

        const { insuranceNumber, insuranceCompany, vehicle } = req.body;

        console.log("Insurance Number", insuranceNumber);

        
        const existingInsurance = await insuranceCollection.findOne({ insuranceNumber });
        if (existingInsurance) {
            return res.status(400).json({ message: "Une assurance avec ce numéro existe déjà." });
        }

        const newInsurance = new Insurance({
            insuranceNumber,
            insuranceCompany,
            subscriber,
            vehicle
        });

        // Insert the new insurance document
        await insuranceCollection.insertOne(newInsurance);

        return res.status(201).json({ message: 'Assurance ajoutée avec succès', insurance: newInsurance });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'assurance :", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}

async function getInsuranceById(req, res) {
    try {
        const insuranceId = req.params.id;
        if (!insuranceId) {
            return res.status(400).json({ error: "Identifiant de l'assurance manquant dans la requête" });
        }

        const insurance = await insuranceCollection.findOne({ _id: insuranceId });
        if (!insurance) {
            return res.status(404).json({ error: "Assurance non trouvée" });
        }

        return res.status(200).json({ insurance });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'assurance :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

// PATCH /api/insurances/:id
async function editInsurance(req, res) {
    try {
        // Similar JWT and validation handling as editCar
        const insuranceId = req.params.id;
        const fieldsToUpdate = req.body;

        // Check for the existence of the insurance
        const existingInsurance = await insuranceCollection.findOne({ _id: insuranceId });
        if (!existingInsurance) {
            return res.status(404).json({ error: "Cette assurance n'existe pas" });
        }

        // Update the insurance document
        await insuranceCollection.updateOne({ _id: insuranceId }, { $set: fieldsToUpdate });

        // Fetch the updated document to return
        const updatedInsurance = await insuranceCollection.findOne({ _id: insuranceId });

        return res.status(200).json({ message: "Assurance mise à jour avec succès", insurance: updatedInsurance });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'assurance :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}
        
// DELETE /api/insurances/:id
async function deleteInsurance(req, res) {
    try {
        // Similar JWT handling as deleteCarById
        const insuranceId = req.params.id;
        if (!insuranceId) {
            return res.status(400).json({ error: "Identifiant de l'assurance manquant dans la requête" });
        }

         // Check for the existence of the insurance
        const existingInsurance = await insuranceCollection.findOne({ _id: insuranceId });
        if (!existingInsurance) {
            return res.status(404).json({ error: "Cette assurance n'existe pas" });
        }

    // Optionally, handle any cleanup like removing references to this insurance from vehicles or other entities

    // Delete the insurance document
        await insuranceCollection.deleteOne({ _id: insuranceId });

        return res.status(200).json({ message: "Assurance supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'assurance :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

module.exports = {
addInsurance,
getInsuranceById,
editInsurance,
deleteInsurance
};