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

module.exports ={
    ensureAuth,
}