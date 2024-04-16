const { getDb } = require('../../mongoConnection');
const jwt = require('../../utils/jwt');
const { body, validationResult } = require('express-validator');
const Insurance = require('../../modeles/insurance/insurance');
const { myCache, encryptData, decryptData } = require("../../utils/cache");

const AES_KEY = process.env.AES_KEY
const MAINDB = process.env.MAINDB;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;

const mainDb = getDb(MAINDB);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

async function validateInsuranceFields(req) {
    await Promise.all([
        // body('insuranceNumber').notEmpty().withMessage('Le numéro d\'assurance est requis').run(req),
        body('insuranceCompany').notEmpty().withMessage('La compagnie d\'assurance est requise').run(req),
        // body('vehicle').notEmpty().withMessage('Le véhicule est requis').run(req),
        // body('vehicleRegistrationNumber').notEmpty().withMessage('Le numéro d\'immatriculation du véhicule est requis').run(req),
        // body('vehicleBrand').notEmpty().withMessage('La marque du véhicule est requise').run(req),
        // body('vehicleModel').notEmpty().withMessage('Le modèle du véhicule est requis').run(req),
        // body('vehicleYear').isInt().withMessage('L\'année du véhicule doit être un nombre entier').run(req),
        body('policyNumber').notEmpty().withMessage('Le numéro de police est requis').run(req),
        // body('coverageType').notEmpty().withMessage('Le type de couverture est requis').run(req),
        // body('startDate').notEmpty().isISO8601().withMessage('La date de début est requise et doit être une date valide').run(req),
        body('expirationDate').notEmpty().isISO8601().withMessage('La date d\'expiration est requise et doit être une date valide').run(req)
        // Vous pouvez ajouter plus de validations selon les champs de votre modèle d'assurance
    ]);
}

// Fonction de validation pour les champs à mettre à jour
async function validateUpdateInsuranceFields(req) {
    await Promise.all([
        body('policyNumber').notEmpty().withMessage('Le numéro de police est requis').run(req),
        // body('coverageType').notEmpty().withMessage('Le type de couverture est requis').run(req),
        // body('startDate').notEmpty().isISO8601().withMessage('La date de début est requise et doit être une date valide').run(req),
        body('expirationDate').notEmpty().isISO8601().withMessage('La date d\'expiration est requise et doit être une date valide').run(req),
        // Assurez-vous de valider également les champs du véhicule si nécessaire
        body('vehicleId').notEmpty().withMessage('L\'identifiant du véhicule est requis').run(req)  // Assurez-vous que ce champ est requis si vous permettez la mise à jour du véhicule associé
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

        const {vehicleId} = req.params;
        const { policyNumber, insuranceCompany, expirationDate } = req.body;
        

        // Extraire les données du véhicule à partir de la base de données
        // vehicle, vehicleRegistrationNumber, vehicleBrand, vehicleModel, vehicleYear

        const vehicle = vehicleId;
        console.log("Vehicle", vehicle);

        const vehicleData = await vehicleCollection.findOne({ _id: vehicle });
        if (!vehicleData) {
            return res.status(404).json({ error: "Véhicule non trouvé" });
        }

        const { plate, brand, model, year } = vehicleData;
        const vehicleRegistrationNumber = plate;
        const vehicleBrand = brand;
        const vehicleModel = model;
        const vehicleYear = year;

        
        // Vérification de l'existence préalable d'une assurance avec le même numéro
        const existingInsurance = await insuranceCollection.findOne({ policyNumber });
        if (existingInsurance) {
            return res.status(400).json({ message: "Une assurance avec ce numéro existe déjà." });
        }

        // Création de la nouvelle assurance
        const newInsurance = new Insurance({
            // insuranceNumber,
            insuranceCompany,
            subscriber: subscriber, // récupéré depuis le token
            vehicle,
            vehicleRegistrationNumber,
            vehicleBrand,
            vehicleModel,
            vehicleYear,
            policyNumber,
            // coverageType,
            // startDate: new Date(startDate),
            expirationDate: new Date(expirationDate)
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

        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ error: "Le Token n'est pas fourni" });
        }
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ error: "Token invalide" });
        }
        const subscriber = myToken.user_id;

        
        // Exécution des validations
        await validateUpdateInsuranceFields(req);

        const {policyNumber, expirationDate, vehicleId } = req.body;

        // Supposons que vous souhaitez mettre à jour l'assurance avec les nouvelles informations du véhicule
        const vehicleData = await vehicleCollection.findOne({ _id: vehicleId });
        if (!vehicleData) {
            return res.status(404).json({ error: "Véhicule non trouvé" });
        }
        const { plate, brand, model, year } = vehicleData;

        const fieldsToUpdate = {
            policyNumber,
            // coverageType,
            // startDate: new Date(startDate),
            expirationDate: new Date(expirationDate),
            vehicle: vehicleId, // Vous pouvez choisir de ne pas permettre la modification du véhicule associé
            vehicleRegistrationNumber: plate,
            vehicleBrand: brand,
            vehicleModel: model,
            vehicleYear: year
        };

        const updatedInsurance = await insuranceCollection.findOneAndUpdate(
            { _id: insuranceId },
            { $set: fieldsToUpdate },
            { returnDocument: 'after' }
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


async function getInsuranceByUserId(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ message: "Le Token n'est pas fourni" });
        }
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ message: "Token invalide" });
        }
        const userIdFromToken = myToken.user_id;

        const {userId} = req.params;
        
        if (userId !== userIdFromToken) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        // Clé de cache unique pour l'utilisateur
        const cacheKey = `insurancesUID_${userId}`;
        const cachedInsurances = myCache.get(cacheKey);

        if (cachedInsurances) {
            console.log("Retour des données d'assurance depuis le cache");
            const decryptedData = decryptData(cachedInsurances, AES_KEY);
            return res.status(200).json({ insurances: decryptedData });
        } else {
            const insurances = await insuranceCollection.find({ subscriber: userId }).toArray();
            if (insurances.length === 0) {
                return res.status(404).json({ message: "Aucune assurance trouvée pour cet utilisateur" });
            }

            // Mise en cache des données d'assurance après le chiffrement
            const encryptedData = encryptData(insurances, AES_KEY);
            myCache.set(cacheKey, encryptedData, 600); // Expiration après 600 secondes

            return res.status(200).json({ insurances });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des assurances par utilisateur :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

async function getInsuranceByVehicleId(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ error: "Le Token n'est pas fourni" });
        }
        const myToken = jwt.decoded(token);
        if (!myToken) {
            return res.status(400).json({ error: "Token invalide" });
        }
        const userIdFromToken = myToken.user_id;

        const vehicleId = req.params.vehicleId;

        // Clé de cache unique pour le véhicule
        const cacheKey = `insurances_vehicle_${vehicleId}`;
        const cachedInsurances = myCache.get(cacheKey);

        if (cachedInsurances) {
            console.log("Retour des données d'assurance depuis le cache");
            const decryptedData = decryptData(cachedInsurances, AES_KEY);
            return res.status(200).json({ insurances: decryptedData });
        } else {
            // Vérifier la propriété du véhicule
            const vehicle = await vehicleCollection.findOne({ _id: vehicleId, owner: userIdFromToken });
            if (!vehicle) {
                return res.status(403).json({ message: "Accès refusé ou véhicule non trouvé" });
            }

            const insurances = await insuranceCollection.find({ vehicle: vehicleId }).toArray();
            if (insurances.length === 0) {
                return res.status(404).json({ message: "Aucune assurance trouvée pour ce véhicule" });
            }

            // Mise en cache des données d'assurance après le chiffrement
            const encryptedData = encryptData(insurances, AES_KEY);
            myCache.set(cacheKey, encryptedData, 600); // Expiration après 600 secondes

            return res.status(200).json({ insurances });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des assurances par véhicule :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}





module.exports = {
addInsurance,
getInsuranceById,
editInsurance,
deleteInsurance,
getInsuranceByUserId,
getInsuranceByVehicleId
};