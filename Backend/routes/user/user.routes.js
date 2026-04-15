/**
 * Fichier de routage pour la gestion des utilisateurs.
 * Ce fichier définit les routes pour les opérations liées aux utilisateurs,
 * telles que l'authentification, l'inscription, la gestion du profil et des images,
 * ainsi que la gestion des permis de conduire.
 * Il utilise les middlewares d'authentification et de gestion des fichiers multipart/form-data.
 */

const { Router } = require("express");
const router = Router();

// MIDDLEWARES
// Importation du middleware d'authentification JWT
const userAuth = require("../../auth/jwt.authenticated.js");

// CONTROLLERS
// Importation des contrôleurs pour la gestion des utilisateurs et des permis de conduire
const userController = require("../../controllers/user/user.controller.js");
const driverLicenseController = require("../../controllers/driverLicense/driverLicense.controller.js");

// VARIABLES
// Chemins pour la sauvegarde des images des utilisateurs, des profils et des permis de conduire
const USER_ROUTER_IMG_PATH = process.env.USER_ROUTER_IMG_PATH;
const USER_ROUTER_IMG_IDS_PATH = process.env.USER_ROUTER_IMG_IDS_PATH;
const USER_ROUTER_IMG_PROFILE_PATH = process.env.USER_ROUTER_IMG_PROFILE_PATH;

// ADMIN FILES AND IMAGES
// Importation du middleware pour la gestion des fichiers multipart/form-data
const multiparty = require("connect-multiparty");

// IMAGES PATH
// Configuration des middlewares pour l'upload des images
const md_uploadUserImg = multiparty({ uploadDir: `${USER_ROUTER_IMG_PATH}` });
const md_uploadUserProfileImg = multiparty({
  uploadDir: `${USER_ROUTER_IMG_PROFILE_PATH}`,
});
const md_uploadUserLicenceImg = multiparty({
  uploadDir: `${USER_ROUTER_IMG_IDS_PATH}`,
});

// Route pour uploader et sauvegarder l'image de profil de l'utilisateur
// Utilise les middlewares d'authentification et de gestion des fichiers pour les images de profil
router.patch(
  "/user/upload-profile-image",
  [userAuth.ensureAuth, md_uploadUserProfileImg],
  userController.UploadUserProfileImage,
);

// Route pour supprimer l'image de profil de l'utilisateur
// Utilise le middleware d'authentification
router.delete(
  "/user/delete-profile-image",
  userAuth.ensureAuth,
  userController.DeleteUserProfileImage,
);

// Route pour uploader et sauvegarder les photos du permis de conduire de l'utilisateur (selfie, recto, verso)
// Utilise les middlewares d'authentification et de gestion des fichiers pour les images des permis de conduire
router.patch(
  "/user/upload-driving-licence-photos",
  [userAuth.ensureAuth, md_uploadUserLicenceImg],
  userController.UploadUserDrivingLicencePhoto,
);

// Route to stream profile images stored in GridFS
router.get(
  "/user/profile-image/:id",
  userController.StreamUserProfileImage,
);

// Route to stream driving licence images stored in GridFS
router.get(
  "/user/driving-licence-photo/:id",
  userController.StreamDrivingLicenceImage,
);

// Route pour authentifier un utilisateur en utilisant un token JWT
// Utilise le middleware d'authentification
router.post(
  "/user/login/token",
  userAuth.ensureAuth,
  userController.LoginWithToken,
);

// Route pour enregistrer de nouveaux utilisateurs
router.post("/user/register", userController.RegisterUser);

// Route pour envoyer le code de vérification lors de l'inscription
router.post("/user/register/code", userController.RegisterUserSendCode);

// Route pour vérifier le code de vérification lors de l'inscription
router.post("/user/register/verify", userController.RegisterUserVerifyCode);

// Route pour permettre aux utilisateurs de se connecter
router.post("/user/login", userController.Login);

// Route pour l'authentification Google OAuth
router.post("/user/google-auth", userController.GoogleAuth);

// Route pour permettre aux utilisateurs de se déconnecter
// Utilise le middleware d'authentification
router.post("/user/logout", [userAuth.ensureAuth], userController.Logout);

// Route pour rafraîchir la session d'un utilisateur (nouveau token)
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/user/refresh",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.RefresLogin,
);

// Route pour obtenir le profil de l'utilisateur authentifié par son ID
// Utilise les middlewares d'authentification et de vérification de session active
router.get(
  "/user/profile/:id",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.GetUserById,
);

// Route pour restaurer le mot de passe de l'utilisateur
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/user/password/reset",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.RestorePassword,
);

// Route pour modifier les informations de l'utilisateur
// Utilise les middlewares d'authentification, de vérification de session active et de gestion des fichiers
router.patch(
  "/user",
  [userAuth.ensureAuth, userAuth.isActiveSession, md_uploadUserImg],
  userController.EditUser,
);

// Route pour envoyer un code de vérification pour la récupération du mot de passe
router.post("/user/password/code", userController.SendVerificationCode);

// Route pour vérifier le code de vérification et récupérer le mot de passe
router.post("/user/password/verify", userController.verifyAndChangePassword);

// Route pour supprimer un utilisateur de la base de données
// Utilise les middlewares d'authentification et de vérification de session active
router.delete(
  "/user/:id?",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.DeleteUser,
);

/* CODE QR USER INFO ENDPOINTS */

// Route pour générer un code QR
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/code/generate",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.generateQRCode,
);

// Route pour obtenir l'ID utilisateur et envoyer toutes les informations utilisateur
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/code/read",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.readAndSendUserInfo,
);

// Route pour renvoyer un code de vérification
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/code/resend",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.resendVerificationCode,
);

/* ENCRYPT DATA TESTING ENDPOINTS */

// Route pour tester la sécurité des données chiffrées
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/test/data/encrypt",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.encryptMyData,
);

// Route pour obtenir les informations complètes du véhicule de l'utilisateur (auto, assurance)
// Utilise les middlewares d'authentification et de vérification de session active
router.get(
  "/user/vehicle/info/:vehicleId",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.getMyAutoFullInfo,
);

// Route pour valider l'inscription d'un utilisateur
// Utilise les middlewares d'authentification et de vérification de session active
router.post(
  "/user/validate/:id?",
  [userAuth.ensureAuth, userAuth.isActiveSession],
  userController.validateInscription,
);

module.exports = router;
