const { getDb } = require('../../mongoConnection');
const jwt = require('../../utils/jwt');

// VALIDATE INFOS
const { body, validationResult } = require('express-validator');
// FILES MANAGEMENT
const { deleteUploadedFiles, checkFileSize, checkFileQuantity, getFilePath, getFileName } = require('../../utils/files');
// MODELS
const Vehicle = require('../../modeles/vehicle/vehicle');
const Immatriculation = require('../../modeles/immatriculation/immatriculation');
// NODE MAILER
const { sendVerificationEmail } = require('../../utils/nodemailer');
const { sendExpirationEmail ,sendNotificationMail} = require('../../utils/nodemailer');

// CACHE
const { myCache, encryptData, decryptData } = require("../../utils/cache");

// VARIABLES
const AES_KEY = process.env.AES_KEY
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const VEHICLESCOLLECTION = process.env.VEHICLESCOLLECTION;


const mainDb = getDb(MAINDB);
const vehicleCollection = mainDb.collection(VEHICLESCOLLECTION);
const userCollection = mainDb.collection(USERSCOLLECTION);


/**
 * 
 * @param {*} req 
 */
async function validateFields(req) {
    await Promise.all([
        body('brand').notEmpty().withMessage('La marque est requise').run(req),
        body('model').notEmpty().withMessage('Le modèle est requis').run(req),
        body('year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('L\'année doit être valide').run(req),
        body('color').notEmpty().withMessage('La couleur est requise').run(req),,
        body('plate').notEmpty().withMessage('Le numéro de plaque est requis').run(req),,
        body('serialNumber').notEmpty().withMessage('Le numéro de serie est requis').run(req)
    ]);
}

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

        const ownerId = myToken.user_id;

        const { brand, model, year, color, plate, serialNumber } = req.body;

        // Exécution des validations
        await validateFields(req);
        

        // Vérifie les erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Récupère seulement le premier message d'erreur
            const errorMessage = errors.array()[0].msg;
            console.log(`Erreurs de validation lors de la création du locataire : ${errorMessage}`);
            return res.status(400).json({ error: errorMessage });
        }

        // Vérifie si la voiture est déjà associée à ce propriétaire
        const [existingCarForOwner, existingCarSerialForOwner] = await Promise.all([
            userCollection.findOne({ _id: ownerId, vehicles: plate }),
            userCollection.findOne({ _id: ownerId, serialNumber: serialNumber })
        ]);
        if (existingCarForOwner || existingCarSerialForOwner) {
            return res.status(400).json({ message: "Cette voiture est déjà associée à ce propriétaire." });
        }

        // Vérifie si une voiture avec cette plaque d'immatriculation existe déjà
        const [existingCar, existingCarSerial] = await Promise.all([
            vehicleCollection.findOne({ plate }),
            vehicleCollection.findOne({ serialNumber })
        ]);
        if (existingCar || existingCarSerial) {
            return res.status(400).json({ message: "Une voiture avec cette plaque d'immatriculation existe déjà." });
        }

        // Crée une nouvelle voiture
        const newCar = new Vehicle({ 
            brand, 
            model, 
            year, 
            color, 
            plate, 
            serialNumber, 
            owner: ownerId 
        });

        // Insère la nouvelle voiture dans la collection et met à jour les informations du propriétaire
        await Promise.all([
            vehicleCollection.insertOne(newCar),
            userCollection.updateOne({ _id: ownerId }, { $addToSet: { vehicles: newCar._id} })
        ]);
        
        // Immatriculation 
        //console.log(req.body.immatriculation);
        //await addImmatriculationV2(ownerId ,newCar._id, req.body.immatriculation);

        // Met à jour le cache avec les informations de la nouvelle voiture
        const cacheKeyCar = `${ownerId}_${newCar._id}`;
        const encryptedCarData = encryptData(newCar, AES_KEY);
        myCache.set(cacheKeyCar, encryptedCarData, 600);
        
        // Met à jour la clé associée au propriétaire dans le cache avec les informations de la nouvelle voiture
        const cacheKey = `${ownerId}`;
        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            // Si les données sont en cache, les renvoyer directement
            console.log("Données trouvées dans le cache. Mise à jour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            decryptedData.vehicles.push(newCar._id); // Ajout de la nouvelle plaque
            const reencryptedData = encryptData(decryptedData, AES_KEY); // Rechiffrement des données mises à jour
            myCache.set(cacheKey, reencryptedData, 600); // Mise à jour du cache
            return res.status(200).json({ vehicle: decryptedData });
        }

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
      
      const ownerId = myToken.user_id;
  
      // Récupérer l'identifiant de la voiture depuis les paramètres de la requête
      const carId = req.params.id;
  
      // Vérifier si l'identifiant de la voiture est fourni
      if (!carId) {
        return res.status(400).json({ error: "Identifiant de voiture manquant dans la requête" });
      }

      // Vérification si les données du locataire sont en cache
      const cacheKeyCar = `${ownerId}_${carId}`;
      const cachedData = myCache.get(cacheKeyCar);
      if (cachedData) {
      // Si les données sont en cache, les renvoyer directement
      console.log(`Données trouvées dans le cache. Retour du cache...`);
      const decryptedData = decryptData(cachedData, AES_KEY);
      return res.status(200).json({ vehicle: decryptedData });
      }
    
      // Vérifier si la voiture existe pas dans la base de donnée 
      const carFunded = await vehicleCollection.findOne({ _id: carId });
      if (!carFunded) {
        return res.status(403).json({ error: "Ce vehicule n'existe pas dans la base de donnée" });
      } 

      // Vérifier si l'utilisateur a la voiture dans son champ vehicles
      const user = await userCollection.findOne({ _id: ownerId, vehicles: carFunded._id });
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

        const ownerId = myToken.user_id;

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
        const user = await userCollection.findOne({ _id: ownerId, vehicles: carId });
        if (!user) {
            return res.status(403).json({ error: "L'utilisateur n'a pas accès à cette voiture" });
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
        const cacheKeyCar = `${ownerId}_${carId}`;
        const encryptedTenantData = encryptData(carInDataBase, AES_KEY);
        myCache.set(cacheKeyCar, encryptedTenantData, 600);

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

      const ownerId = myToken.user_id;

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
      const user = await userCollection.findOne({ _id: ownerId, vehicles: getCarById });
      if (!user) {
          return res.status(403).json({ error: "L'utilisateur n'a pas accès à cette voiture" });
      }

      // Retirer carFunded.plate du champ vehicles de l'utilisateur
      await userCollection.updateOne(
          { _id: ownerId },
          { $pull: { vehicles: carId } }
      );

      // Supprimer la voiture de la base de données
      await vehicleCollection.deleteOne({ _id: carId });

      // Supprimer les données de cache associées à cette voiture (si présentes)
      const cacheKeyCar = `${ownerId}_${carId}`;
      myCache.del(cacheKeyCar);

      // Met à jour la clé associée au propriétaire dans le cache avec les informations de la nouvelle voiture
      const cacheKey = `${ownerId}`;
      const cachedData = myCache.get(cacheKey);
      if (cachedData) {
            // Si les données sont en cache, les renvoyer directement
            console.log("Données trouvées dans le cache. Mise à jour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            decryptedData.vehicles.pull(carId); 
            const reencryptedData = encryptData(decryptedData, AES_KEY); 
            myCache.set(cacheKey, reencryptedData, 600); 
            return res.status(200).json({ vehicle: decryptedData });
      }

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

        const ownerId = myToken.user_id;

        // Verification de l'utilisateur dans la base de donne
        const user = await userCollection.findOne({ _id: ownerId });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Récupérer les voitures de l'utilisateur à partir de la collection des véhicules
        const cars = await vehicleCollection.find({ owner: ownerId }).toArray();

        // Retourner les voitures de l'utilisateur
        return res.status(200).json({ cars });
    } catch (error) {
        console.error("Erreur lors de la récupération des voitures de l'utilisateur :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

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

        const ownerId = myToken.user_id;

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
        const user = await userCollection.findOne({ _id: ownerId, vehicles: carId });
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
        const cacheKeyCar = `${ownerId}_${carId}`;
        const encryptedTenantData = encryptData(carInDataBase, AES_KEY);
        myCache.set(cacheKeyCar, encryptedTenantData, 600);

        // Met à jour la clé associée au propriétaire dans le cache avec les informations de la nouvelle voiture
        const cacheKey = `${ownerId}`;
        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            // Si les données sont en cache, les renvoyer directement
            console.log("Données trouvées dans le cache. Mise à jour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            decryptedData.isActive.set(!car.isActive); 
            const reencryptedData = encryptData(decryptedData, AES_KEY); 
            myCache.set(cacheKey, reencryptedData, 600); 
            return res.status(200).json({ vehicle: decryptedData });
        }

        // Renvoyer les informations de la voiture mise à jour
        return res.status(200).json({ message: 'Activation/désactivation de la voiture réussie', car: carInDataBase });
    } catch (error) {
        console.error("Erreur lors de l'activation/désactivation de la voiture :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

// Fonctions liees a l'immatriculations specifiquements 
async function addImmatriculation(req, res) {
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

        const ownerId = myToken.user_id;

        // Récupérer l'identifiant du véhicule depuis les paramètres de la requête
        const carId = req.params.id;

        // Vérifier si l'identifiant du véhicule est fourni
        if (!carId) {
            return res.status(400).json({ error: "Identifiant de véhicule manquant dans la requête" });
        }

        // Extraction des données d'immatriculation à ajouter de la requête
        const immatriculationData = req.body;

        // Vérification si le véhicule existe dans la base de données
        const car = await vehicleCollection.findOne({ _id: carId });
        if (!car) {
            return res.status(404).json({ error: "Véhicule non trouvé" });
        }

        // Vérifier si l'utilisateur a accès à ce véhicule
        const user = await userCollection.findOne({ _id: ownerId, vehicles: carId });
        if (!user) {
            return res.status(403).json({ error: "L'utilisateur n'a pas accès à ce véhicule" });
        }

        // Vérifier si le véhicule a déjà des informations d'immatriculation
        if (car.immatriculation) {
            return res.status(400).json({ error: "Ce véhicule a déjà des informations d'immatriculation" });
        }

        // Ajouter les informations d'immatriculation au véhicule
        await vehicleCollection.updateOne(
            { _id: carId },
            { $set: { immatriculation: immatriculationData } }
        );

        // Mettre à jour le cache si nécessaire
        const cacheKeyCar = `${ownerId}_${carId}`;
        const cachedData = myCache.get(cacheKeyCar);
        if (cachedData) {
            // Si les données sont en cache, les mettre à jour
            console.log("Données trouvées dans le cache. Mise à jour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            decryptedData.immatriculation = immatriculationData;
            const reencryptedData = encryptData(decryptedData, AES_KEY);
            myCache.set(cacheKeyCar, reencryptedData, 600);
        }

        return res.status(200).json({ message: 'Informations d\'immatriculation ajoutées avec succès au véhicule' });
    } catch (error) {
        console.error("Erreur lors de l'ajout des informations d'immatriculation au véhicule :", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

// Fonction privée pour ajouter les informations d'immatriculation à un véhicule
async function addImmatriculationV2(ownerId, carId, immatriculationData) {
    try {
        // Vérifier si le véhicule existe dans la base de données
        const car = await vehicleCollection.findOne({ _id: carId });
        if (!car) {
            throw new Error("Véhicule non trouvé");
        }

        // Vérifier si le véhicule a déjà des informations d'immatriculation
        if (car.immatriculation) {
            throw new Error("Ce véhicule a déjà des informations d'immatriculation");
        }

        // Créer une nouvelle instance du modèle Immatriculation
        const newImmatriculation = new Immatriculation(immatriculationData);
        // Valider les champs des informations d'immatriculation
        await newImmatriculation.validate();

        // Ajouter les informations d'immatriculation au véhicule
        await vehicleCollection.updateOne(
            { _id: carId },
            { $set: { immatriculation: newImmatriculation } }
        );

        // Mettre à jour le cache si nécessaire
        const cacheKeyCar = `${ownerId}_${carId}`;
        const cachedData = myCache.get(cacheKeyCar);
        if (cachedData) {
            // Si les données sont en cache, les mettre à jour
            const decryptedData = decryptData(cachedData, AES_KEY);
            decryptedData.immatriculation = immatriculationData;
            const reencryptedData = encryptData(decryptedData, AES_KEY);
            myCache.set(cacheKeyCar, reencryptedData, 600);
        }
    } catch (error) {
        throw new Error(`Erreur lors de l'ajout des informations d'immatriculation au véhicule : ${error.message}`);
    }
}

async function checkUserImmatriculationExpiration(ownerId) {
    try {
        // Récupérer tous les véhicules de l'utilisateur spécifié
        const userCars = await vehicleCollection.find({ owner: ownerId }).toArray();

        // Parcourir tous les véhicules de l'utilisateur pour vérifier la date d'expiration de l'immatriculation
        userCars.forEach(async (car) => {
            const immatriculationDate = new Date(car.immatriculation.date);
            const currentDate = new Date();

            // Vérifier si la date d'expiration est dépassée
            if (currentDate > immatriculationDate) {
                // Envoyer un email à l'utilisateur pour informer de l'expiration de l'immatriculation du véhicule
                await sendExpirationEmail(ownerId, car._id);
            }
        });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'expiration de l'immatriculation :", error);
        throw new Error("Erreur lors de la vérification de l'expiration de l'immatriculation");
    }
}

/**
 * Route PUT /api/cars/updateImmatriculation pour mettre à jour les informations d'immatriculation d'une voiture.
 * @param {Object} req - Requête HTTP contenant les nouvelles informations d'immatriculation.
 * @param {Object} res - Réponse HTTP pour renvoyer le résultat de la mise à jour.
 * @returns {Object} Une réponse HTTP indiquant le succès ou l'échec de la mise à jour.
 */
async function updateImmatriculation(req, res) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            console.error("Le Token n'est pas fourni");
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }

        const myToken = jwt.decode(token);
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        const ownerId = myToken.user_id;
        // Récupérer l'identifiant de la voiture depuis les paramètres de la requête
        const vehicleId = req.params.id;
        const immatriculationData = req.body;

        // Valider les données d'immatriculation avec le modèle Immatriculation
        const newImmatriculation = new Immatriculation(immatriculationData);
        await newImmatriculation.validate();

        // Rechercher la voiture par ID et propriétaire
        const car = await vehicleCollection.findOne({ _id: vehicleId, owner: ownerId });
        if (!car) {
            return res.status(404).json({ message: "Voiture non trouvée" });
        }

        // Mettre à jour les informations d'immatriculation
        await vehicleCollection.updateOne({ _id: vehicleId }, { $set: { immatriculation: immatriculationData } });

        // Mettre à jour le cache si nécessaire
        const cacheKey = `${ownerId}_${vehicleId}`;
        const cachedData = myCache.get(cacheKey);
        if (cachedData) {
            console.log("Données trouvées dans le cache. Mise à jour du cache...");
            const decryptedData = decryptData(cachedData, AES_KEY);
            decryptedData.immatriculation = immatriculationData; // Mise à jour des informations d'immatriculation
            const reencryptedData = encryptData(decryptedData, AES_KEY); // Rechiffrement
            myCache.set(cacheKey, reencryptedData, 600); // Mise à jour du cache
        }

        return res.status(200).json({ message: 'Informations d\'immatriculation mises à jour avec succès' });
    } catch (error) {
        console.error("Erreur lors de la mise à jour des informations d'immatriculation :", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}


/**
 * Valide les champs des informations d'immatriculation.
 * @param {Object} immatriculationData - Les données d'immatriculation à valider.
 * @throws {Error} Une erreur si la validation échoue.
 */
function validateImmatriculationFields(immatriculationData) {
    const {
        numeroCertificatImmatriculation,
        dateDelivrance,
        dateExpiration,
        numeroEssieux,
        masseNette,
        cylindree,
        numeroDossier,
        categorieUsage
    } = immatriculationData;

    // Validation des champs obligatoires
    if (!numeroCertificatImmatriculation) {
        throw new Error("Le numéro de certificat d'immatriculation est requis");
    }
    if (!dateDelivrance || !isValidDate(dateDelivrance)) {
        throw new Error("La date de délivrance est invalide");
    }
    if (!dateExpiration || !isValidDate(dateExpiration)) {
        throw new Error("La date d'expiration est invalide");
    }

    // Validation des champs optionnels
    if (numeroEssieux !== undefined && typeof numeroEssieux !== 'number') {
        throw new Error("Le numéro d'essieux doit être un nombre");
    }
    if (masseNette !== undefined && typeof masseNette !== 'number') {
        throw new Error("La masse nette doit être un nombre");
    }
    if (cylindree !== undefined && typeof cylindree !== 'number') {
        throw new Error("La cylindrée doit être un nombre");
    }
    if (numeroDossier !== undefined && typeof numeroDossier !== 'string') {
        throw new Error("Le numéro de dossier doit être une chaîne de caractères");
    }
    if (categorieUsage !== undefined && typeof categorieUsage !== 'string') {
        throw new Error("La catégorie d'usage doit être une chaîne de caractères");
    }
}

/**
 * Vérifie si une date est valide.
 * @param {string} dateString - La chaîne représentant la date.
 * @returns {boolean} true si la date est valide, sinon false.
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}


module.exports = {
    addCar, // Ajouter une voiture
    getCarById, // Obtenir une voiture par son ID
    editCar, // Modifier une voiture par son ID
    deleteCarById, // Supprimer une voiture par son ID
    getAllCars, // Obtenir toutes les voitures d'un utilisateur connecté 
    toggleCarActivation, // Activer ou désactiver une voiture par son ID
    addImmatriculation,
    updateImmatriculation,
  };
  
  
