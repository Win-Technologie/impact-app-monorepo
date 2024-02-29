const jwt = require("jsonwebtoken");
const VARS = require('../../vars');
// const VARS = require('../../vars');
const { getDb } = require('../mongoConnection');

// const JWT_KEY = VARS.JWTSTKEY;


// Accéder aux zones authentifiées du site web
function createAccessToken(user) {

    // const expToken = new Date();// Obtenez la date et l'heure actuelles
    // // Définir l'heure d'expiration du jeton, dans ce cas, 3 heures après sa création
    // expToken.setHours(expToken.getHours() + 8760);
    const expToken = new Date();
    expToken.setFullYear(expToken.getFullYear() + 1);
    // Créer un objet de charge utile pour le jeton (contenant toutes les données)
    const payload = {
        token_type: "access", // Type de jeton, dans ce cas, "access"
        user_id: user._id, // Identifiant unique de l'utilisateur associé au jeton

        iat: Date.now(), // Heure d'émission du jeton (en millisecondes depuis le 1er janvier 1970)
        exp: expToken.getTime(), // Heure d'expiration du jeton (en millisecondes depuis le 1er janvier 1970)
    };

    // Signer la charge utile et obtenir le jeton en utilisant la clé secrète
    return jwt.sign(payload, VARS.JWTSTKEY);
}

// Révoquer un token (appelé lors de la déconnexion)
async function revokeToken(token) {
    try {
        const tokenAlreadyRevoked = await isTokenRevoked(token);
        console.log(tokenAlreadyRevoked);

        if(tokenAlreadyRevoked){
            console.log('Token deja révoqué');
            return ; 
        }
        else{
            const mainDb = getDb(`${VARS.MAINDB}`);
            const tknCollection = mainDb.collection(VARS.TKNRVKCOLLECTION);

            // Sauvegarder l'utilisateur dans la base de données
            const insertResult = await tknCollection.insertOne({tkn : token});

            if (!insertResult || !insertResult.acknowledged) {
                // Gestion de l'erreur lors de l'insertion
                return res.status(500).json({ msg: "Erreur d'insertion token" });
            }
            console.log('Token révoqué');

        }

    } catch (error) {
        console.error("Erreur lors de la révocation du token :", error);
    }
}

// Vérifier si un token est révoqué
async function isTokenRevoked(token) {
    try {
        const mainDb = getDb(`${VARS.MAINDB}`);
        const tknCollection = mainDb.collection(VARS.TKNRVKCOLLECTION);
        
        const tokenFound = await tknCollection.findOne({ tkn: token });
        // console.log(' Voici le tokenFound : ');
        // console.log(tokenFound);
        return tokenFound != null; // Renvoie true si le token est trouvé
    } catch (error) {
        console.error("Erreur lors de la vérification du token 3333:", error);
        return false;
    }
}


async function removeRevokedTokens() {
    try {
        // Conecta a la base de datos principal
        const mainDb = getDb(VARS.MAINDB);
        
        // Obtiene la colección de tokens revocados
        const tknCollection = mainDb.collection(VARS.TKNRVKCOLLECTION);

        // Elimina todos los tokens revocados
        const deleteResult = await tknCollection.deleteMany({});
        
        console.log(`Se eliminaron ${deleteResult.deletedCount} tokens revocados.`);
        
        return true;
    } catch (error) {
        console.error("Error al eliminar tokens revocados:", error);
        return false;
    }
}

// Obtenir les données du token
function decoded(token) {
    return jwt.decode(token, VARS.JWTSTKEY, true);
}

module.exports = {
    createAccessToken,
    revokeToken,
    decoded,
    removeRevokedTokens,
};