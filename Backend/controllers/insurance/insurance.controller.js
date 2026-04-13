const { getDb } = require("../../mongoConnection");
const jwt = require("../../utils/jwt");
const { body, validationResult } = require("express-validator");
const Insurance = require("../../modeles/insurance/insurance");
const { myCache, encryptData, decryptData } = require("../../utils/cache");

const AES_KEY = process.env.AES_KEY;
const MAINDB = process.env.MAINDB;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLESCOLLECTION;

const mainDb = getDb(MAINDB);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);

async function validateInsuranceFields(req) {
  await Promise.all([
    // body('insuranceNumber').notEmpty().withMessage('Le numéro d\'assurance est requis').run(req),
    body("insuranceCompany")
      .notEmpty()
      .withMessage("La compagnie d'assurance est requise")
      .run(req),
    // body('vehicle').notEmpty().withMessage('Le véhicule est requis').run(req),
    // body('vehicleRegistrationNumber').notEmpty().withMessage('Le numéro d\'immatriculation du véhicule est requis').run(req),
    // body('vehicleBrand').notEmpty().withMessage('La marque du véhicule est requise').run(req),
    // body('vehicleModel').notEmpty().withMessage('Le modèle du véhicule est requis').run(req),
    // body('vehicleYear').isInt().withMessage('L\'année du véhicule doit être un nombre entier').run(req),
    body("policyNumber")
      .notEmpty()
      .withMessage("Le numéro de police est requis")
      .run(req),
    // body('coverageType').notEmpty().withMessage('Le type de couverture est requis').run(req),
    // body('startDate').notEmpty().isISO8601().withMessage('La date de début est requise et doit être une date valide').run(req),
    body("expirationDate")
      .notEmpty()
      .isISO8601()
      .withMessage(
        "La date d'expiration est requise et doit être une date valide",
      )
      .run(req),
    // Vous pouvez ajouter plus de validations selon les champs de votre modèle d'assurance
  ]);
}

// Fonction de validation pour les champs à mettre à jour
async function validateUpdateInsuranceFields(req) {
  await Promise.all([
    body("policyNumber")
      .notEmpty()
      .withMessage("Le numéro de police est requis")
      .run(req),
    // body('coverageType').notEmpty().withMessage('Le type de couverture est requis').run(req),
    // body('startDate').notEmpty().isISO8601().withMessage('La date de début est requise et doit être une date valide').run(req),
    body("expirationDate")
      .notEmpty()
      .isISO8601()
      .withMessage(
        "La date d'expiration est requise et doit être une date valide",
      )
      .run(req),
    // Assurez-vous de valider également les champs du véhicule si nécessaire
    body("vehicleId")
      .notEmpty()
      .withMessage("L'identifiant du véhicule est requis")
      .run(req), // Assurez-vous que ce champ est requis si vous permettez la mise à jour du véhicule associé
  ]);
}

/**
 * Ajoute une nouvelle assurance pour un véhicule spécifié.
 *
 * Cette fonction gère la requête pour ajouter une nouvelle assurance à un véhicule. Elle vérifie l'authentification de l'utilisateur via un token JWT,
 * valide les champs de la requête, récupère les informations du véhicule à partir de la base de données, vérifie si une assurance avec le même numéro
 * de police existe déjà, puis crée et insère un nouveau document d'assurance dans la collection 'insurances'. En cas de succès, elle renvoie une réponse JSON
 * avec le statut de l'opération et les détails de l'assurance ajoutée.
 *
 * @param {*} req Requête HTTP contenant les données de l'assurance à ajouter dans req.body et les paramètres du véhicule dans req.params.
 * @param {*} res Réponse HTTP pour renvoyer le résultat de l'opération.
 * @returns Renvoie une réponse JSON avec le statut de l'opération et les détails de l'assurance ajoutée en cas de succès, ou une erreur en cas d'échec.
 */
async function addInsurance(req, res) {
  try {
    // Vérifier si le token est fourni dans les en-têtes Authorization
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.error("Le Token n'est pas fourni");
      return res.status(400).json({ msg: "Le Token n'est pas fourni" });
    }

    // Décoder le token JWT pour obtenir l'ID de l'utilisateur
    const myToken = jwt.decoded(token);
    if (!myToken || !myToken.user_id) {
      return res.status(400).json({ msg: "Token invalide" });
    }

    const subscriber = myToken.user_id;

    // Validation des champs de la requête
    await validateInsuranceFields(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Invalid insurance add payload:", req.body, errors.array());
      const errorMessage = errors.array()[0].msg;
      return res.status(400).json({ error: errorMessage, details: errors.array() });
    }

    // Extraire l'ID du véhicule à assurer depuis les paramètres de la requête
    const { vehicleId } = req.params;

    // Rechercher les données du véhicule dans la base de données
    const vehicleData = await vehicleCollection.findOne({ _id: vehicleId });
    if (!vehicleData) {
      return res.status(404).json({ error: "Véhicule non trouvé" });
    }

    // Extraire les informations pertinentes du véhicule
    const { plate, brand, model, year } = vehicleData;
    const vehicleRegistrationNumber = plate;
    const vehicleBrand = brand;
    const vehicleModel = model;
    const vehicleYear = year;

    // Vérifier l'existence préalable d'une assurance avec le même numéro de police
    const { policyNumber, insuranceCompany, expirationDate } = req.body;
    const existingInsurance = await insuranceCollection.findOne({
      policyNumber,
    });
    if (existingInsurance) {
      return res
        .status(400)
        .json({ message: "Une assurance avec ce numéro existe déjà." });
    }

    // Créer une nouvelle instance de l'assurance
    const newInsurance = new Insurance({
      insuranceCompany,
      subscriber,
      vehicle: vehicleId,
      vehicleRegistrationNumber,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      policyNumber,
      expirationDate: new Date(expirationDate),
    });

    // Insérer le nouveau document d'assurance dans la collection 'insurances'
    await insuranceCollection.insertOne(newInsurance);

    // Répondre avec une confirmation JSON de l'ajout réussi de l'assurance
    return res
      .status(201)
      .json({
        message: "Assurance ajoutée avec succès",
        insurance: newInsurance,
      });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'assurance :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

// FONCTIONNEL | CACHE IMPLEMENTE | Manque le test sur le cache
async function getInsuranceById(req, res) {
  try {
    const insuranceId = req.params.id;
    if (!insuranceId) {
      return res
        .status(400)
        .json({ error: "Identifiant de l'assurance manquant dans la requête" });
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
      return res
        .status(400)
        .json({ error: "Identifiant de l'assurance manquant dans la requête" });
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

    //Verifier si l'assurance appartient à l'utilisateur
    const existingInsurance = await insuranceCollection.findOne({
      _id: insuranceId,
    });
    if (!existingInsurance) {
      return res.status(404).json({ error: "Cette assurance n'existe pas" });
    }
    if (existingInsurance.subscriber !== subscriber) {
      return res
        .status(403)
        .json({ error: "Vous n'êtes pas autorisé à modifier cette assurance" });
    }

    // Exécution des validations
    await validateUpdateInsuranceFields(req);
    const updateErrors = validationResult(req);
    if (!updateErrors.isEmpty()) {
      console.error("Invalid insurance update payload:", req.body, updateErrors.array());
      return res.status(400).json({ error: updateErrors.array()[0].msg, details: updateErrors.array() });
    }

    const { policyNumber, expirationDate, vehicleId } = req.body;

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
      vehicleYear: year,
    };

    const updatedInsurance = await insuranceCollection.findOneAndUpdate(
      { _id: insuranceId },
      { $set: fieldsToUpdate },
      { returnDocument: "after" },
    );

    // Mettre à jour le cache
    if (updatedInsurance.value) {
      const cacheKey = `${subscriber}_${insuranceId}`;
      const encryptedData = encryptData(updatedInsurance.value, AES_KEY);
      myCache.set(cacheKey, encryptedData, 600);

      return res
        .status(200)
        .json({
          message: "Assurance mise à jour avec succès",
          insurance: updatedInsurance.value,
        });
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
      return res
        .status(400)
        .json({ error: "Identifiant de l'assurance manquant dans la requête" });
    }

    // Check for the existence of the insurance
    const existingInsurance = await insuranceCollection.findOne({
      _id: insuranceId,
    });
    if (!existingInsurance) {
      return res.status(404).json({ error: "Cette assurance n'existe pas" });
    }

    // Check if the insurance belongs to the user
    if (existingInsurance.subscriber !== subscriber) {
      return res
        .status(403)
        .json({
          error: "Vous n'êtes pas autorisé à supprimer cette assurance",
        });
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

    const { userId } = req.params;

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
      const insurances = await insuranceCollection
        .find({ subscriber: userId })
        .toArray();
      if (insurances.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune assurance trouvée pour cet utilisateur" });
      }

      // Mise en cache des données d'assurance après le chiffrement
      const encryptedData = encryptData(insurances, AES_KEY);
      myCache.set(cacheKey, encryptedData, 600); // Expiration après 600 secondes

      return res.status(200).json({ insurances });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des assurances par utilisateur :",
      error,
    );
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
      const vehicle = await vehicleCollection.findOne({
        _id: vehicleId,
        owner: userIdFromToken,
      });
      if (!vehicle) {
        return res
          .status(403)
          .json({ message: "Accès refusé ou véhicule non trouvé" });
      }

      const insurances = await insuranceCollection
        .find({ vehicle: vehicleId })
        .toArray();
      if (insurances.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune assurance trouvée pour ce véhicule" });
      }

      // Mise en cache des données d'assurance après le chiffrement
      const encryptedData = encryptData(insurances, AES_KEY);
      myCache.set(cacheKey, encryptedData, 600); // Expiration après 600 secondes

      return res.status(200).json({ insurances });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des assurances par véhicule :",
      error,
    );
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

module.exports = {
  addInsurance,
  getInsuranceById,
  editInsurance,
  deleteInsurance,
  getInsuranceByUserId,
  getInsuranceByVehicleId,
};
