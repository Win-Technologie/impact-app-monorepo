const jwt = require("jsonwebtoken");
const { isTokenRevoked } = require('../utils/jwt');

function ensureAuth(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: "La requête ne contient pas l'en-tête d'authentification" });
        }
        const token = req.headers.authorization.replace("Bearer ", "");

        const payload = jwt.decode(token);
        // console.log(payload);
        const { exp } = payload;
        const currentData = new Date().getTime();

        if (exp <= currentData) {
            return res.status(403).send({ msg: "Le Token a expiré" });
        } else {
            req.user = payload;
            next();
        }

    } catch (error) {
        return res.status(400).send({ msg: "Token invalide" });
    }
}

async function isActiveSession(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: "La requête ne contient pas l'en-tête d'authentification" });
        }
        const token = req.headers.authorization.replace("Bearer ", "");
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

module.exports ={
    ensureAuth,
    isActiveSession
}