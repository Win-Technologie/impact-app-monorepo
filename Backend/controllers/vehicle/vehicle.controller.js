const jwt = require('../../utils/jwt');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../../modeles/vehicle/vehicle');
const { getDb } = require('../../mongoConnection');
const { myCache, encryptData, decryptData } = require("../../utils/cache");
const VARS = require('../../../vars');

const mainDb = getDb(VARS.MAINDB);
const vehicleCollection = mainDb.collection(VARS.VEHICLESCOLLECTION);
const userCollection = mainDb.collection(VARS.USERSCOLLECTION);


/**
 * Middleware pour valider les champs de la requête.
 */
const validateFields = [
  body('brand').notEmpty().withMessage('La marque est requise'),
  body('model').notEmpty().withMessage('Le modèle est requis'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('L\'année doit être valide'),
  body('color').notEmpty().withMessage('La couleur est requise'),
  body('plate').notEmpty().withMessage('Le numéro de plaque est requis'),
  body('registrationNumber').notEmpty().withMessage('Le numéro d\'immatriculation est requis'),
  body('owner').notEmpty().withMessage('L\'identifiant du propriétaire est requis')
];

/**
 * Route POST /api/cars/add pour ajouter une nouvelle voiture pour un utilisateur.
 * @param {Object} req - Requête HTTP contenant les informations de la nouvelle voiture.
 * @param {Object} res - Réponse HTTP pour renvoyer le résultat de l'ajout de la voiture.
 * @returns {Object} Une réponse HTTP indiquant le succès ou l'échec de l'ajout de la voiture.
 */
async function addCar(req, res) {
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

        const userId = myToken.user_id;

        const { brand, model, year, color, plate, serialNumber, owner } = req.body;

        // Validation des champs de la requête
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const [existingCarForOwner, existingCarSerialForOwner] = await Promise.all([
            userCollection.findOne({ _id: userId, vehicles: plate }),
            userCollection.findOne({ _id: userId, serialNumber: serialNumber })
        ]);
        if (existingCarForOwner || existingCarSerialForOwner) {
            return res.status(400).json({ message: "Cette voiture est déjà associée à ce propriétaire." });
        }

        const [existingCar, existingCarSerial] = await Promise.all([
            vehicleCollection.findOne({ plate }),
            vehicleCollection.findOne({ serialNumber })
        ]);
        if (existingCar || existingCarSerial) {
            return res.status(400).json({ message: "Une voiture avec cette plaque d'immatriculation existe déjà." });
        }

        const newCar = new Vehicle({ 
            brand, 
            model, 
            year, 
            color, 
            plate, 
            serialNumber, 
            owner 
        });

        await Promise.all([
            vehicleCollection.insertOne(newCar),
            userCollection.updateOne({ _id: owner }, { $addToSet: { vehicles: plate } })
        ]);

        const cacheKey = `${userId}_${newCar._id}`;
        const encryptedCarData = encryptData(newCar, VARS.AES_KEY);
        myCache.set(cacheKey, encryptedCarData, 600);

        return res.status(201).json({ message: 'Voiture ajoutée avec succès', car: newCar });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la voiture :", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}




/**
 * Route GET /api/cars/:id pour récupérer les informations d'une voiture par son identifiant.
 * @param {Object} req - Requête HTTP contenant l'identifiant de la voiture.
 * @param {Object} res - Réponse HTTP pour renvoyer les informations de la voiture.
 * @returns {Object} Une réponse HTTP contenant les informations de la voiture demandée.
 */
async function getCarById(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        console.error('Le Token n\'est pas fourni');
        return res.status(400).json({ msg: "Le Token n'est pas fourni" });
      }
      
      const myToken = jwt.decoded(token);
      if (!myToken) {
        return res.status(400).json({ msg: "Token invalide" });
      }
      
      const userId = myToken.user_id;
  
      // Récupérer l'identifiant de la voiture depuis les paramètres de la requête
      const carId = req.params.id;
  
      // Vérifier si l'identifiant de la voiture est fourni
      if (!carId) {
        return res.status(400).json({ error: "Identifiant de voiture manquant dans la requête" });
      }

      // Vérification si les données du locataire sont en cache
      const cacheKey = `${userId}_${carId}`;
      const cachedData = myCache.get(cacheKey);
      if (cachedData) {
      // Si les données sont en cache, les renvoyer directement
      console.log(`Données trouvées dans le cache. Retour du cache...`);
      const decryptedData = decryptData(cachedData, VARS.AES_KEY);
      return res.status(200).json({ vehicle: decryptedData });
      }
    
      // Vérifier si la voiture existe pas dans la base de donnée dans son champ vehicles
      const carFunded = await vehicleCollection.findOne({ _id: carId });
      if (!carFunded) {
        return res.status(403).json({ error: "Ce vehicule n'existe pas dans la base de donnée" });
      } 

      // Vérifier si l'utilisateur a la voiture dans son champ vehicles
      const user = await userCollection.findOne({ _id: userId, vehicles: carFunded.plate });
      if (!user) {
        return res.status(403).json({ error: "L'utilisateur n'a pas accès à cette voiture" });
      }
  
      // Recherche de la voiture dans la base de données par son identifiant
      const car = await vehicleCollection.findOne({ _id: carId });
  
      // Vérifier si la voiture existe
      if (!car) {
        return res.status(404).json({ error: "Voiture non trouvée" });
      }
  
      // Renvoyer les informations de la voiture
      return res.status(200).json({ car });
    } catch (error) {
      console.error("Erreur lors de la récupération de la voiture par identifiant :", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
  

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  async function editCar(req, res) {
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

        const userId = myToken.user_id;

        // Récupérer l'identifiant de la voiture depuis les paramètres de la requête
        const carId = req.params.id;

        // Vérifier si l'identifiant de la voiture est fourni
        if (!carId) {
            return res.status(400).json({ error: "Identifiant de voiture manquant dans la requête" });
        }

        // Extraction des données à mettre à jour de la requête
        const fieldsToUpdate = req.body;

        // Vérification si la voiture existe dans la base de données
        const carFunded = await vehicleCollection.findOne({ _id: carId });
        if (!carFunded) {
            return res.status(403).json({ error: "Ce véhicule n'existe pas dans la base de données" });
        }

        // Vérifier si l'utilisateur a accès à cette voiture
        const user = await userCollection.findOne({ _id: userId, vehicles: carFunded.plate });
        if (!user) {
            return res.status(403).json({ error: "L'utilisateur n'a pas accès à cette voiture" });
        }

        // Si le champ "plate" est présent dans fieldsToUpdate, mettre à jour le champ "vehicles" de l'utilisateur
        if (fieldsToUpdate.plate) {
            // Retirer l'ancien "plate" de la liste des véhicules de l'utilisateur
            await userCollection.updateOne(
                { _id: userId },
                { $pull: { vehicles: carFunded.plate } }
            );

            // Ajouter le nouveau "plate" à la liste des véhicules de l'utilisateur
            await userCollection.updateOne(
                { _id: userId },
                { $addToSet: { vehicles: fieldsToUpdate.plate } }
            );
        }

        // Mettre à jour les informations de la voiture dans la base de données
        const updatedCar = await vehicleCollection.findOneAndUpdate(
            { _id: carId },
            { $set: fieldsToUpdate },
            { new: true }
        );

        if (!updatedCar) {
            return res.status(404).json({ error: "Voiture non trouvée" });
        }  

        // Récupérer les informations de la voiture mises à jour depuis la base de données
        const carInDataBase = await vehicleCollection.findOne({ _id: carId });
        
        // Mise à jour du cache (si nécessaire)
        const cacheKey = `${userId}_${carId}`;
        const encryptedTenantData = encryptData(carInDataBase, VARS.AES_KEY);
        myCache.set(cacheKey, encryptedTenantData, 600);

        // Renvoyer les informations de la voiture mises à jour directement depuis la mise à jour dans la base de données
        return res.status(200).json({ message: 'Voiture mise à jour avec succès', car: carInDataBase });
    } catch (error) {
        console.error("Erreur lors de la modification de la voiture :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function deleteCarById(req, res) {
  try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
          console.error('Le Token n\'est pas fourni');
          return res.status(400).json({ msg: "Le Token n'est pas fourni" });
      }

      const myToken = jwt.decoded(token);
      if (!myToken) {
          return res.status(400).json({ msg: "Token invalide" });
      }

      const userId = myToken.user_id;

      // Récupérer l'identifiant de la voiture depuis les paramètres de la requête
      const carId = req.params.id;

      // Vérifier si l'identifiant de la voiture est fourni
      if (!carId) {
          return res.status(400).json({ error: "Identifiant de voiture manquant dans la requête" });
      }

      // Vérifier si la voiture existe dans la base de données
      const carFunded = await vehicleCollection.findOne({ _id: carId });
      if (!carFunded) {
          return res.status(403).json({ error: "Cette voiture n'existe pas dans la base de données" });
      }

      // Vérifier si l'utilisateur a accès à cette voiture
      const user = await userCollection.findOne({ _id: userId, vehicles: carFunded.plate });
      if (!user) {
          return res.status(403).json({ error: "L'utilisateur n'a pas accès à cette voiture" });
      }

      // Retirer carFunded.plate du champ vehicles de l'utilisateur
      await userCollection.updateOne(
          { _id: userId },
          { $pull: { vehicles: carFunded.plate } }
      );

      // Supprimer la voiture de la base de données
      await vehicleCollection.deleteOne({ _id: carId });

      // Supprimer les données de cache associées à cette voiture (si présentes)
      const cacheKey = `${userId}_${carId}`;
      myCache.del(cacheKey);

      // Renvoyer une réponse indiquant que la voiture a été supprimée avec succès
      return res.status(200).json({ message: 'Voiture supprimée avec succès' });
  } catch (error) {
      console.error("Erreur lors de la suppression de la voiture par identifiant :", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function getAllCars(req, res) {
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

        const userId = myToken.user_id;

        // Verification de l'utilisateur dans la base de donne
        const user = await userCollection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Récupérer les voitures de l'utilisateur à partir de la collection des véhicules
        const cars = await vehicleCollection.find({ owner: userId }).toArray();

        // Retourner les voitures de l'utilisateur
        return res.status(200).json({ cars });
    } catch (error) {
        console.error("Erreur lors de la récupération des voitures de l'utilisateur :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}



/**
 * Route POST /api/cars/toggle-activation/:id pour activer ou désactiver une voiture par son ID.
 * @param {Object} req - Requête HTTP contenant l'identifiant de la voiture.
 * @param {Object} res - Réponse HTTP pour renvoyer le résultat de l'opération d'activation ou de désactivation.
 * @returns {Object} Une réponse HTTP indiquant le succès ou l'échec de l'opération.
 */
/**
 * Fonction pour activer ou désactiver une voiture par son ID.
 * @param {Object} req - Requête HTTP contenant l'identifiant de la voiture à activer ou désactiver.
 * @param {Object} res - Réponse HTTP pour renvoyer le résultat de l'activation ou de la désactivation de la voiture.
 * @returns {Object} Une réponse HTTP indiquant le succès ou l'échec de l'activation ou de la désactivation de la voiture.
 */
async function toggleCarActivation(req, res) {
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

        const userId = myToken.user_id;

        // Récupérer l'identifiant de la voiture depuis les paramètres de la requête
        const carId = req.params.id;

        // Vérifier si l'identifiant de la voiture est fourni
        if (!carId) {
            return res.status(400).json({ error: "Identifiant de voiture manquant dans la requête" });
        }

        // Vérifier si la voiture existe dans la base de données
        const car = await vehicleCollection.findOne({ _id: carId });
        if (!car) {
            return res.status(404).json({ error: "Voiture non trouvée" });
        }

        // Vérifier si l'utilisateur a accès à cette voiture
        const user = await userCollection.findOne({ _id: userId, vehicles: car.plate });
        if (!user) {
            return res.status(403).json({ error: "L'utilisateur n'a pas accès à cette voiture" });
        }

        // Inverser l'état d'activation de la voiture
        const updatedCar = await vehicleCollection.findOneAndUpdate(
            { _id: carId },
            { $set: { isActive: !car.isActive } },
            { new: true }
        );

        // Récupérer les informations de la voiture mises à jour depuis la base de données
        const carInDataBase = await vehicleCollection.findOne({ _id: carId });
        
        // Mise à jour du cache (si nécessaire)
        const cacheKey = `${userId}_${carId}`;
        const encryptedTenantData = encryptData(carInDataBase, VARS.AES_KEY);
        myCache.set(cacheKey, encryptedTenantData, 600);

        // Renvoyer les informations de la voiture mise à jour
        return res.status(200).json({ message: 'Activation/désactivation de la voiture réussie', car: carInDataBase });
    } catch (error) {
        console.error("Erreur lors de l'activation/désactivation de la voiture :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}


/**
 * Route GET /api/cars/search pour rechercher des voitures par marque, modèle ou couleur.
 * @param {Object} req - Requête HTTP contenant les critères de recherche dans le champ body.
 * @param {Object} res - Réponse HTTP pour renvoyer les voitures correspondant aux critères de recherche.
 * @returns {Object} Une réponse HTTP contenant les voitures correspondant aux critères de recherche.
 */
async function searchCars(req, res) {
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

        const userId = myToken.user_id;

        // Extraction des critères de recherche du champ body de la requête
        const fieldsToUpdate = req.body;

        // Vérification si au moins un critère de recherche est fourni
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ error: "Au moins un critère de recherche est requis" });
        }

        // Vérification si les critères de recherche sont autorisés
        const allowedFields = ['brand', 'model', 'color'];
        const invalidFields = Object.keys(fieldsToUpdate).filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Champ(s) de recherche non autorisé(s) : ${invalidFields.join(', ')}` });
        }

        // Recherche des voitures correspondant aux critères de recherche pour l'utilisateur connecté
        const cars = await vehicleCollection.find({ owner: userId, ...fieldsToUpdate }).toArray();

        // Retourner les voitures correspondant aux critères de recherche
        return res.status(200).json({ cars });
    } catch (error) {
        console.error("Erreur lors de la recherche des voitures :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}




module.exports = {
    addCar, // Ajouter une voiture
    getCarById, // Obtenir une voiture par son ID
    editCar, // Modifier une voiture par son ID
    deleteCarById, // Supprimer une voiture par son ID
    getAllCars, // Obtenir toutes les voitures d'un utilisateur connecté 
    toggleCarActivation, // Activer ou désactiver une voiture par son ID
    searchCars, // Rechercher des voitures par marque, modèle ou couleur
  };
  
  
