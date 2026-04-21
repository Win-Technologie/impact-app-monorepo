const jwt = require("jsonwebtoken");
const { getDb } = require("../mongoConnection");
const { isTokenRevoked } = require("../utils/jwt");
const { ObjectId } = require("mongodb");

const USERSCOLLECTION = process.env.USERSCOLLECTION;
const MAINDB = process.env.MAINDB;

const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);

function ensureAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(403).send({ msg: "La requête ne contient pas l'en-tête d'authentification" });
    }
    const token = auth.replace("Bearer ", "");

    // Verify signature and expiration using the JWT secret
    const secret = process.env.JWTSTKEY;
    if (!secret) {
      return res.status(500).send({ msg: "JWT secret non configuré" });
    }

    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({ msg: "Le Token a expiré" });
    }
    return res.status(401).send({ msg: "Token invalide", error: error.message });
  }
}

async function isActiveSession(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(403).send({ msg: "La requête ne contient pas l'en-tête d'authentification" });
    }
    const token = auth.replace("Bearer ", "");
    const tokenAlreadyRevoked = await isTokenRevoked(token);

    if (tokenAlreadyRevoked) {
      return res.status(401).json({ msg: "La session de l'utilisateur a expiré" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
  }
}

async function isCompletedUser(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(403).send({ msg: "La requête ne contient pas l'en-tête d'authentification" });
    }
    const token = auth.replace("Bearer ", "");
    const tokenAlreadyRevoked = await isTokenRevoked(token);

    if (tokenAlreadyRevoked) {
      return res.status(401).json({ msg: "La session de l'utilisateur a expiré" });
    }

    // Ensure we have the decoded user on req (ensureAuth should run before this middleware)
    let loggedInUser = req.user;
    if (!loggedInUser) {
      const secret = process.env.JWTSTKEY;
      if (!secret) return res.status(500).json({ msg: "JWT secret non configuré" });
      loggedInUser = jwt.verify(token, secret);
    }

    // Support payloads that may store the user id as _id or sub
    const userId = loggedInUser._id || loggedInUser.sub || loggedInUser.id;
    if (!userId) return res.status(403).send({ msg: "Identifiant utilisateur manquant dans le token" });

    const user = await userCollection.findOne({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(403).send({ msg: "Aucun enregistrement n'a été trouvé." });
    }

    if (!user.allFieldsComplete) {
      return res.status(403).send({ msg: "L'utilisateur n'a pas complété toute son inscription." });
    }

    next();
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "La session de l'utilisateur a expiré" });
    }
    return res.status(500).json({ msg: "Erreur interne du serveur", error: error.message });
  }
}

module.exports = {
  ensureAuth,
  isActiveSession,
  isCompletedUser,
};
