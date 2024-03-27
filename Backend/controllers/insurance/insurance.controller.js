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


// FONCTIONNEL | CACHE IMPLEMENTE | Manque le test sur le cache
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

        // Insérer le nouveau document d'assurance
        await insuranceCollection.insertOne(newInsurance);

        // Construire la clé de cache et mettre en cache les données de l'assurance
        const cacheKey = `${subscriber}_${newInsurance._id}`;
        const encryptedData = encryptData(newInsurance, AES_KEY);
        myCache.set(cacheKey, encryptedData, 600);

        return res.status(201).json({ message: 'Assurance ajoutée avec succès', insurance: newInsurance });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'assurance :", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}

// FONCTIONNEL | CACHE IMPLEMENTE | Manque le test sur le cache
async function getInsuranceById(req, res) {
    try {
        const insuranceId = req.params.id;
        if (!insuranceId) {
            return res.status(400).json({ error: "Identifiant de l'assurance manquant dans la requête" });
        }

        // Extraire le token et décoder pour obtenir l'userId
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ error: "Le Token n'est pas fourni" });
        }
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ error: "Token invalide" });
        }
        const userId = myToken.user_id;

        // Construire la clé de cache
        const cacheKey = `${userId}_${insuranceId}`;

        // Vérifier si les données de l'assurance sont en cache
        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            console.log("Données trouvées dans le cache. Retour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            return res.status(200).json({ insurance: decryptedData });
        }

        // Si non en cache, récupérer depuis la base de données
        const insurance = await insuranceCollection.findOne({ _id: insuranceId });
        if (!insurance) {
            return res.status(404).json({ error: "Assurance non trouvée" });
        }

        // Mettre en cache les données de l'assurance
        const encryptedData = encryptData(insurance, AES_KEY);
        myCache.set(cacheKey, encryptedData, 600); // Expiration du cache après 600 secondes

        // Retourner les données de l'assurance
        return res.status(200).json({ insurance });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'assurance :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}


// MANQUE LA VERIFICATION SUR LES CHAMPS MODIFIABLES | CACHE IMPLEMENTE | Manque le test sur le cache
async function editInsurance(req, res) {
    try {
        const insuranceId = req.params.id;
        if (!insuranceId) {
            return res.status(400).json({ error: "Identifiant de l'assurance manquant dans la requête" });
        }

        // Extraire le token et décoder pour obtenir l'userId
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ error: "Le Token n'est pas fourni" });
        }
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ error: "Token invalide" });
        }
        const subscriber = myToken.user_id;

        const updatedInsurance = await insuranceCollection.findOneAndUpdate(
            { _id: insuranceId },
            { $set: fieldsToUpdate },
            { returnDocument: 'after' } // Assurez-vous de renvoyer le document mis à jour
        );

        // Mettre à jour le cache
        if (updatedInsurance.value) {
            const cacheKey = `${subscriber}_${insuranceId}`;
            const encryptedData = encryptData(updatedInsurance.value, AES_KEY);
            myCache.set(cacheKey, encryptedData, 600);

            return res.status(200).json({ message: "Assurance mise à jour avec succès", insurance: updatedInsurance.value });
        } else {
            return res.status(404).json({ error: "Assurance non trouvée" });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'assurance :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

// ANCIENNE VERSION FONCTIONNEL SANS CACHE | A MODIFIER
// async function editInsurance(req, res) {
//     try {
//         // Similar JWT and validation handling as editCar
//         const insuranceId = req.params.id;
//         const fieldsToUpdate = req.body;

//         // Check for the existence of the insurance
//         const existingInsurance = await insuranceCollection.findOne({ _id: insuranceId });
//         if (!existingInsurance) {
//             return res.status(404).json({ error: "Cette assurance n'existe pas" });
//         }

//         // Update the insurance document
//         await insuranceCollection.updateOne({ _id: insuranceId }, { $set: fieldsToUpdate });

//         // Fetch the updated document to return
//         const updatedInsurance = await insuranceCollection.findOne({ _id: insuranceId });

//         return res.status(200).json({ message: "Assurance mise à jour avec succès", insurance: updatedInsurance });
//     } catch (error) {
//         console.error("Erreur lors de la mise à jour de l'assurance :", error);
//         return res.status(500).json({ error: "Erreur interne du serveur" });
//     }
// }
        
// FONCTIONNEL | Manque le cache



// FONCTIONNEL | CACHE IMPLEMENTE | Manque le test sur le cache
async function deleteInsurance(req, res) {
    try {
        // Extraire le token et décoder pour obtenir l'userId
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ error: "Le Token n'est pas fourni" });
        }
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ error: "Token invalide" });
        }
        const subscriber = myToken.user_id;
        
        const insuranceId = req.params.id;
        if (!insuranceId) {
            return res.status(400).json({ error: "Identifiant de l'assurance manquant dans la requête" });
        }

         // Check for the existence of the insurance
        const existingInsurance = await insuranceCollection.findOne({ _id: insuranceId });
        if (!existingInsurance) {
            return res.status(404).json({ error: "Cette assurance n'existe pas" });
        }

    
    // Supprimer les données de cache associées à cette assurance
    const cacheKey = `${subscriber}_${insuranceId}`;
    myCache.del(cacheKey);    

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