const jwt = require("jsonwebtoken");

const { getDb } = require("../mongoConnection");

const MAINDB = process.env.MAINDB;
const JWTSTKEY = process.env.JWTSTKEY;
const TKNRVKCOLLECTION = process.env.TKNRVKCOLLECTION;

// Accéder aux zones authentifiées du site web
function createAccessToken(user) {
  // const expToken = new Date();// Obtenez la date et l'heure actuelles
  // // Définir l'heure d'expiration du jeton, dans ce cas, 3 heures après sa création
  // expToken.setHours(expToken.getHours() + 8760);
  const expToken = new Date();
  // expToken.setMonth(expToken.getMonth() + 1);
  expToken.setFullYear(expToken.getFullYear() + 1);
  // Créer un objet de charge utile pour le jeton (contenant toutes les données)
  const payload = {
    token_type: "access", // Type de jeton, dans ce cas, "access"
    access_type: "access_type",
    user_id: user._id, // Identifiant unique de l'utilisateur associé au jeton
    iat: Date.now(), // Heure d'émission du jeton (en millisecondes depuis le 1er janvier 1970)
    exp: expToken.getTime(), // Heure d'expiration du jeton (en millisecondes depuis le 1er janvier 1970)
  };

  // Signer la charge utile et obtenir le jeton en utilisant la clé secrète
  return jwt.sign(payload, JWTSTKEY);
}

function createTemporalToken(user) {
  const currentDate = new Date();
  // // Définir l'heure d'expiration du jeton, dans ce cas, 15 jours après sa création
  const expToken = new Date(currentDate);
  expToken.setDate(expToken.getDate() + 15);
  // Créer un objet de charge utile pour le jeton (contenant toutes les données)
  const payload = {
    token_type: "access", // Type de jeton, dans ce cas, "access"
    access_type: "temporary",
    user_id: user._id, // Identifiant unique de l'utilisateur associé au jeton
    iat: Date.now(), // Heure d'émission du jeton (en millisecondes depuis le 1er janvier 1970)
    exp: expToken.getTime(), // Heure d'expiration du jeton (en millisecondes depuis le 1er janvier 1970)
  };

  // Signer la charge utile et obtenir le jeton en utilisant la clé secrète
  return jwt.sign(payload, JWTSTKEY);
}

// Révoquer un token (appelé lors de la déconnexion)
async function revokeToken(token) {
  try {
    const tokenAlreadyRevoked = await isTokenRevoked(token);
    console.log(tokenAlreadyRevoked);

    if (tokenAlreadyRevoked) {
      console.log("Token deja révoqué");
      return;
    } else {
      const mainDb = getDb(`${MAINDB}`);
      const tknCollection = mainDb.collection(TKNRVKCOLLECTION);

      // Sauvegarder l'utilisateur dans la base de données
      const insertResult = await tknCollection.insertOne({ tkn: token });

      if (!insertResult || !insertResult.acknowledged) {
        // Gestion de l'erreur lors de l'insertion
        return res.status(500).json({ msg: "Erreur d'insertion token" });
      }
      console.log("Token révoqué");
    }
  } catch (error) {
    console.error("Erreur lors de la révocation du token :", error);
  }
}

// Vérifier si un token est révoqué
async function isTokenRevoked(token) {
  try {
    const mainDb = getDb(`${MAINDB}`);
    const tknCollection = mainDb.collection(TKNRVKCOLLECTION);

    const tokenFound = await tknCollection.findOne({ tkn: token });
    // console.log(' Voici le tokenFound : ');
    // console.log(tokenFound);
    return tokenFound != null; // Renvoie true si le token est trouvé
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return false;
  }
}

//  Suppression des jetons révoqués dans la base de données
async function removeRevokedTokens() {
  try {
    // Se connecte à la base de données principale
    const mainDb = getDb(MAINDB);
    // Obtient la collection de jetons révoqués
    const tknCollection = mainDb.collection(TKNRVKCOLLECTION);
    // Supprime tous les tokens révoqués
    const deleteResult = await tknCollection.deleteMany({});

    console.log(
      `La suppression de ${deleteResult.deletedCount} tokens révoqués a été effectuée.`,
    );

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des tokens révoqués :", error);
    return false;
  }
}

// Renouvellement d'un ancien token pour prolonger la session de l'utilisateur
function createRefreshToken(user) {
  const expToken = new Date();

  // expToken.setMonth(expToken.getMonth() + 1);
  //expToken.setHours(expToken.getHours() + 3);
  expToken.setFullYear(expToken.getFullYear() + 1);

  const payload = {
    token_type: "refresh",
    user_id: user._id, // Identifiant unique de l'utilisateur associé au jeton
    iat: Date.now(), // Heure d'émission du jeton (en millisecondes depuis le 1er janvier 1970)
    exp: expToken.getTime(), // Heure d'expiration du jeton (en millisecondes depuis le 1er janvier 1970)
  };

  return jwt.sign(payload, JWTSTKEY);
}

// Obtenir les données du token
function decoded(token) {
  return jwt.decode(token, JWTSTKEY, true);
}

module.exports = {
  createAccessToken,
  revokeToken,
  decoded,
  removeRevokedTokens,
  createRefreshToken,
  isTokenRevoked,
  createTemporalToken,
};
