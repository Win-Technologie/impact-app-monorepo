const { getDb } = require("../../mongoConnection");
const jwt = require("../../utils/jwt");

// VALIDATE INFOS
const { body, validationResult } = require("express-validator");
// FILES MANAGEMENT
const {
  deleteUploadedFiles,
  checkFileSize,
  checkFileQuantity,
  getFilePath,
  getFileName,
} = require("../../utils/files");
// MODELS
const Vehicle = require("../../modeles/vehicle/vehicle");
const Immatriculation = require("../../modeles/immatriculation/immatriculation");
// NODE MAILER
const { sendVerificationEmail } = require("../../utils/nodemailer");
const {
  sendExpirationEmail,
  sendNotificationMail,
} = require("../../utils/nodemailer");

// CACHE
const { myCache, encryptData, decryptData } = require("../../utils/cache");

// VARIABLES
const AES_KEY = process.env.AES_KEY;
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const VEHICLESCOLLECTION = process.env.VEHICLESCOLLECTION;
const INSURANCES_COLLECTION = process.env.INSURANCESCOLLECTION;
DRIVERSLICENSECOLLECTION = process.env.DRIVERSLICENSECOLLECTION;

const mainDb = getDb(MAINDB);
const vehicleCollection = mainDb.collection(VEHICLESCOLLECTION);
const userCollection = mainDb.collection(USERSCOLLECTION);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);

/**
 *
 * @param {*} req
 */
async function validateFields(req) {
  await Promise.all([
    body("brand").notEmpty().withMessage("La marque est requise").run(req),
    body("model").notEmpty().withMessage("Le modèle est requis").run(req),
    body("year")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage("L'année doit être valide")
      .run(req),
    body("color").notEmpty().withMessage("La couleur est requise").run(req),
    ,
    body("plate")
      .notEmpty()
      .withMessage("Le numéro de plaque est requis")
      .run(req),
    ,
    body("serialNumber")
      .notEmpty()
      .withMessage("Le numéro de serie est requis")
      .run(req),
  ]);
}

/**
 * Route POST /api/cars/add pour ajouter une nouvelle voiture pour un utilisateur.
 *
 * Cette route permet à un utilisateur authentifié d'ajouter une nouvelle voiture à sa collection.
 * La requête HTTP doit contenir un jeton d'authentification valide et les informations nécessaires
 * sur la voiture à ajouter. La réponse HTTP indiquera si l'ajout de la voiture a été un succès ou un échec.
 *
 * @param {Object} req - Requête HTTP contenant les informations de la nouvelle voiture.
 *   - Headers:
 *     - Authorization: Bearer {token} - le jeton JWT pour l'authentification.
 *   - Body:
 *     - brand {string} - Marque de la voiture.
 *     - model {string} - Modèle de la voiture.
 *     - year {number} - Année de fabrication de la voiture.
 *     - color {string} - Couleur de la voiture.
 *     - plate {string} - Plaque d'immatriculation de la voiture.
 *     - serialNumber {string} - Numéro de série de la voiture.
 *     - immatriculation {Object} - Informations d'immatriculation supplémentaires.
 *
 * @param {Object} res - Réponse HTTP pour renvoyer le résultat de l'ajout de la voiture.
 *   - Status: 201 si la voiture a été ajoutée avec succès.
 *   - Status: 400 si des erreurs de validation ou de duplication sont détectées.
 *   - Status: 500 en cas d'erreur interne du serveur.
 *   - Body:
 *     - message {string} - Message indiquant le résultat de l'opération.
 *     - car {Object} - Objet contenant les détails de la voiture ajoutée (en cas de succès).
 *
 * @returns {Object} Une réponse HTTP indiquant le succès ou l'échec de l'ajout de la voiture.
 */
async function addCar(req, res) {
  try {
    // Extraction du jeton d'authentification depuis les en-têtes HTTP
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      console.error("Le Token n'est pas fourni");
      return res.status(400).json({ msg: "Le Token n'est pas fourni" });
    }

    // Décoder le token pour obtenir les informations de l'utilisateur
    const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
    if (!myToken) {
      return res.status(400).json({ msg: "Token invalide" });
    }

    // Récupérer l'identifiant de l'utilisateur à partir du token JWT
    const ownerId = myToken.user_id;

    // Extraction des données de la voiture depuis le corps de la requête
    const { brand, model, year, color, plate, serialNumber } = req.body;
    const immatriculationData = req.body.immatriculation; // Ajout des informations d'immatriculation

    // Exécution des validations
    await validateFields(req);

    // Vérifie les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Récupère seulement le premier message d'erreur
      const errorMessage = errors.array()[0].msg;
      console.log(
        `Erreurs de validation lors de la création du locataire : ${errorMessage}`,
      );
      return res.status(400).json({ error: errorMessage });
    }

    // Vérifie si la voiture est déjà associée à ce propriétaire
    const [existingCarForOwner, existingCarSerialForOwner] = await Promise.all([
      userCollection.findOne({ _id: ownerId, vehicles: plate }),
      userCollection.findOne({ _id: ownerId, serialNumber: serialNumber }),
    ]);
    if (existingCarForOwner) {
      return res
        .status(400)
        .json({ message: "Cette plaque est déjà associée à ce propriétaire." });
    }
    if (existingCarSerialForOwner) {
      return res
        .status(400)
        .json({
          message: "Ce numéro de série est déjà associé à ce propriétaire.",
        });
    }

    // Vérifie si une voiture avec cette plaque d'immatriculation existe déjà
    const existingCar = await vehicleCollection.findOne({ plate });
    if (existingCar) {
      return res
        .status(400)
        .json({
          message:
            "Une voiture avec cette plaque d'immatriculation existe déjà.",
        });
    }

    // Vérifie si une voiture avec ce numéro de série existe déjà
    const existingCarSerial = await vehicleCollection.findOne({ serialNumber });
    if (existingCarSerial) {
      return res
        .status(400)
        .json({ message: "Une voiture avec ce numéro de série existe déjà." });
    }

    // Crée une nouvelle voiture
    const newCar = new Vehicle({
      brand,
      model,
      year,
      color,
      plate,
      serialNumber,
      owner: ownerId,
    });

    // Insère la nouvelle voiture dans la collection et met à jour les informations du propriétaire
    await Promise.all([
      vehicleCollection.insertOne(newCar),
      userCollection.updateOne(
        { _id: ownerId },
        { $addToSet: { vehicles: newCar._id } },
      ),
    ]);

    // Ajoute les informations d'immatriculation à la voiture
    await addImmatriculationV2(ownerId, newCar._id, immatriculationData);

    // Répondre avec un message JSON indiquant le succès de l'ajout de la voiture
    return res
      .status(201)
      .json({ message: "Voiture ajoutée avec succès", car: newCar });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la voiture :", error);
    // En cas d'erreur, renvoyer une réponse d'erreur interne du serveur
    return res.status(500).json({ error: "Erreur interne du serveur" });
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
      return res
        .status(400)
        .json({ error: "Identifiant de voiture manquant dans la requête" });
    }

    // Vérifier si la voiture existe pas dans la base de donnée
    const carFunded = await vehicleCollection.findOne({ _id: carId });
    if (!carFunded) {
      return res
        .status(403)
        .json({ error: "Ce vehicule n'existe pas dans la base de donnée" });
    }

    // Vérifier si l'utilisateur a la voiture dans son champ vehicles
    const user = await userCollection.findOne({
      _id: ownerId,
      vehicles: carFunded._id,
    });
    if (!user) {
      return res
        .status(403)
        .json({ error: "L'utilisateur n'a pas accès à cette voiture" });
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
    console.error(
      "Erreur lors de la récupération de la voiture par identifiant :",
      error,
    );
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
      return res
        .status(400)
        .json({ error: "Identifiant de voiture manquant dans la requête" });
    }

    // Extraction des données à mettre à jour de la requête
    const fieldsToUpdate = req.body;

    // Vérification si la voiture existe dans la base de données
    const carFunded = await vehicleCollection.findOne({ _id: carId });
    if (!carFunded) {
      return res
        .status(403)
        .json({ error: "Ce véhicule n'existe pas dans la base de données" });
    }

    // Vérifier si l'utilisateur a accès à cette voiture
    const user = await userCollection.findOne({
      _id: ownerId,
      vehicles: carId,
    });
    if (!user) {
      return res
        .status(403)
        .json({ error: "L'utilisateur n'a pas accès à cette voiture" });
    }

    // Mettre à jour les informations de la voiture dans la base de données
    const updatedCar = await vehicleCollection.findOneAndUpdate(
      { _id: carId },
      { $set: fieldsToUpdate },
      { new: true },
    );

    if (!updatedCar) {
      return res.status(404).json({ error: "Voiture non trouvée" });
    }

    // Récupérer les informations de la voiture mises à jour depuis la base de données
    const carInDataBase = await vehicleCollection.findOne({ _id: carId });

    // Renvoyer les informations de la voiture mises à jour directement depuis la mise à jour dans la base de données
    return res
      .status(200)
      .json({ message: "Voiture mise à jour avec succès", car: carInDataBase });
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
      return res
        .status(400)
        .json({ error: "Identifiant de voiture manquant dans la requête" });
    }

    // Vérifier si la voiture existe dans la base de données
    const carFunded = await vehicleCollection.findOne({ _id: carId });
    if (!carFunded) {
      return res
        .status(403)
        .json({ error: "Cette voiture n'existe pas dans la base de données" });
    }

    // Vérifier si l'utilisateur a accès à cette voiture
    const user = await userCollection.findOne({
      _id: ownerId,
      vehicles: getCarById,
    });
    if (!user) {
      return res
        .status(403)
        .json({ error: "L'utilisateur n'a pas accès à cette voiture" });
    }

    // Retirer carFunded.plate du champ vehicles de l'utilisateur
    await userCollection.updateOne(
      { _id: ownerId },
      { $pull: { vehicles: carId } },
    );

    // Supprimer la voiture de la base de données
    await vehicleCollection.deleteOne({ _id: carId });

    // Renvoyer une réponse indiquant que la voiture a été supprimée avec succès
    return res.status(200).json({ message: "Voiture supprimée avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la voiture par identifiant :",
      error,
    );
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
    // Étape 1 : Récupération du token d'autorisation
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

    // Étape 2 : Vérification de l'existence de l'utilisateur dans la base de données
    // Verification de l'utilisateur dans la base de donne
    const user = await userCollection.findOne({ _id: ownerId });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Étape 3 : Récupération des voitures de l'utilisateur
    // Récupérer les voitures de l'utilisateur à partir de la collection des véhicules
    const cars = await vehicleCollection.find({ owner: ownerId }).toArray();

    const carIds = cars.map((car) => car._id.toString());

    // Étape 4 : Récupération des assurances pour les véhicules de l'utilisateur
    const insurances = await insuranceCollection
      .find({ vehicle: { $in: carIds } })
      .toArray();

    // Étape 5 : Organisation des données
    const carsWithInsurances = cars.map((car) => {
      const insurance =
        insurances.find((ins) => ins.vehicle === car._id.toString()) || null;
      return {
        car,
        insurance,
      };
    });

    // Étape 6 : Retourner la réponse
    return res.status(200).json({ carsWithInsurances });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des voitures de l'utilisateur :",
      error,
    );
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
      return res
        .status(400)
        .json({ error: "Identifiant de voiture manquant dans la requête" });
    }

    // Vérifier si la voiture existe dans la base de données
    const car = await vehicleCollection.findOne({ _id: carId });
    if (!car) {
      return res.status(404).json({ error: "Voiture non trouvée" });
    }

    // Vérifier si l'utilisateur a accès à cette voiture
    const user = await userCollection.findOne({
      _id: ownerId,
      vehicles: carId,
    });
    if (!user) {
      return res
        .status(403)
        .json({ error: "L'utilisateur n'a pas accès à cette voiture" });
    }

    // Inverser l'état d'activation de la voiture
    const updatedCar = await vehicleCollection.findOneAndUpdate(
      { _id: carId },
      { $set: { isActive: !car.isActive } },
      { new: true },
    );

    // Récupérer les informations de la voiture mises à jour depuis la base de données
    const carInDataBase = await vehicleCollection.findOne({ _id: carId });

    // Renvoyer les informations de la voiture mise à jour
    return res
      .status(200)
      .json({
        message: "Activation/désactivation de la voiture réussie",
        car: carInDataBase,
      });
  } catch (error) {
    console.error(
      "Erreur lors de l'activation/désactivation de la voiture :",
      error,
    );
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * Ajoute des informations d'immatriculation à un véhicule pour un propriétaire donné.
 * Cette fonction vérifie d'abord si le véhicule existe dans la base de données et s'il ne possède pas déjà des informations d'immatriculation.
 * Si le véhicule est trouvé et n'a pas encore d'immatriculation, elle crée un objet `immatriculationData2` avec les informations fournies,
 * puis met à jour le véhicule dans la base de données en ajoutant ces informations d'immatriculation.
 *
 * @param {string} ownerId - L'ID du propriétaire du véhicule.
 * @param {string} carId - L'ID du véhicule à immatriculer.
 * @param {object} immatriculationData - Les données d'immatriculation à ajouter au véhicule.
 * @param {string} immatriculationData.certificateNumber - Le numéro de certificat de l'immatriculation.
 * @param {Date} immatriculationData.issueDate - La date de délivrance du certificat d'immatriculation.
 * @param {Date} immatriculationData.dateExpiration - La date d'expiration du certificat d'immatriculation.
 * @param {number} immatriculationData.ESSIEUXNumber - Le nombre d'essieux du véhicule.
 * @param {number} immatriculationData.netWeight - Le poids net du véhicule.
 * @param {number} immatriculationData.cylinder - La cylindrée du véhicule.
 * @param {string} immatriculationData.fileNumber - Le numéro de dossier associé à l'immatriculation.
 * @param {string} immatriculationData.usageCategory - La catégorie d'utilisation du véhicule.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque les informations d'immatriculation ont été ajoutées au véhicule.
 * @throws {Error} - Lance une erreur si le véhicule n'est pas trouvé, s'il a déjà des informations d'immatriculation ou en cas d'erreur lors de la mise à jour.
 */
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

    // Creer nouvelle de immatriculationData2
    const immatriculationData2 = {
      certificateNumber: immatriculationData.certificateNumber,
      issueDate: immatriculationData.issueDate,
      expirationDate: immatriculationData.dateExpiration,
      ESSIEUXNumber: immatriculationData.ESSIEUXNumber,
      netWeight: immatriculationData.netWeight,
      cylinder: immatriculationData.cylinder,
      fileNumber: immatriculationData.fileNumber,
      usageCategory: immatriculationData.usageCategory,
    };

    // Ajouter les informations d'immatriculation au véhicule
    await vehicleCollection.updateOne(
      { _id: carId },
      { $set: { immatriculation: immatriculationData2 } },
    );
  } catch (error) {
    throw new Error(
      `Erreur lors de l'ajout des informations d'immatriculation au véhicule : ${error.message}`,
    );
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
    console.error(
      "Erreur lors de la vérification de l'expiration de l'immatriculation :",
      error,
    );
    throw new Error(
      "Erreur lors de la vérification de l'expiration de l'immatriculation",
    );
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

    const myToken = jwt.decoded(token);
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
    const car = await vehicleCollection.findOne({
      _id: vehicleId,
      owner: ownerId,
    });
    if (!car) {
      return res.status(404).json({ message: "Voiture non trouvée" });
    }

    // Mettre à jour les informations d'immatriculation
    await vehicleCollection.updateOne(
      { _id: vehicleId },
      { $set: { immatriculation: immatriculationData } },
    );

    return res
      .status(200)
      .json({
        message: "Informations d'immatriculation mises à jour avec succès",
      });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des informations d'immatriculation :",
      error,
    );
    return res.status(500).json({ error: "Erreur interne du serveur" });
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
    categorieUsage,
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
  if (numeroEssieux !== undefined && typeof numeroEssieux !== "number") {
    throw new Error("Le numéro d'essieux doit être un nombre");
  }
  if (masseNette !== undefined && typeof masseNette !== "number") {
    throw new Error("La masse nette doit être un nombre");
  }
  if (cylindree !== undefined && typeof cylindree !== "number") {
    throw new Error("La cylindrée doit être un nombre");
  }
  if (numeroDossier !== undefined && typeof numeroDossier !== "string") {
    throw new Error("Le numéro de dossier doit être une chaîne de caractères");
  }
  if (categorieUsage !== undefined && typeof categorieUsage !== "string") {
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
  updateImmatriculation,
};
