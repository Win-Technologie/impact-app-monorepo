const crypto = require('crypto');
const MYSECRETKEY = process.env.MYSECRETKEY;
const MYPRIVATEKEY = process.env.MYPRIVATEKEY;
const MYPUBLICSECRETKEY = process.env.MYPUBLICSECRETKEY;

// const salt = crypto.randomBytes(16).toString('hex');

const salt = "1j0i2h0g3f0e4d0c5b0a";

// Cryptage symétrique >>> ---------------------------------------------
// Dériver une clé de mot de passe à l'aide de PBKDF2
/* prend un mot de passe et dérive une clé à partir de 
celui-ci en utilisant l'algorithme PBKDF2.*/
function deriveKeyFromPassword(password) {
    /* Le sel est utilisé dans la dérivation de la clé pour 
    renforcer la sécurité en rendant les attaques 
    par force brute plus difficiles.*/
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

// Cryptage symétrique >>> ---------------------------------------------
// Fonction de cryptage des données avec AES
/* prend des données en clair et les crypte en utilisant 
l'algorithme AES avec une clé dérivée du mot de passe et 
un vecteur d'initialisation aléatoire.*/
function encryptDataAES(data) {
    try {
        const iv = crypto.randomBytes(16); // Vecteur d'initialisation aléatoire
        // La clé est dérivée du mot de passe en utilisant la fonction définie précédemment.
        const key = deriveKeyFromPassword(MYSECRETKEY);
        // // Un chiffreur est créé avec la clé dérivée et le vecteur d'initialisation aléatoire.
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encryptedData = cipher.update(data, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        // Le vecteur d'initialisation est converti 
        // en une chaîne hexadécimale pour être inclus dans la sortie.
        return { iv: iv.toString('hex'), ed: encryptedData };

    } catch (error) {
        console.error("encryptDataAES: ERROR, ", error)
    }
}

// Fonction de décryptage des données avec AES
/* prend des données cryptées et les décrypte en 
utilisant l'algorithme AES avec la même clé dérivée 
du mot de passe et le même vecteur d'initialisat */
function decryptDataAES(encryptedData, iv) {
    try {
        // La clé est dérivée du mot de passe en utilisant la même fonction définie précédemment.
        const key = deriveKeyFromPassword(MYSECRETKEY, salt);
        // Un déchiffreur est créé avec la clé dérivée et le vecteur d'initialisation fourni.
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
        // Les données cryptées sont décryptées avec le déchiffreur.
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
        // Les données en clair sont renvoyées.
        return decryptedData;
    } catch (error) {
        console.error("decryptDataAES: ERROR, ", error)
    }
}
//-------------------------------------------------------------------<<<

// Cryptage asynmétrique >>> -------------------------------------------
// Cette fonction génère une paire de clés RSA avec une longueur de module de 4096 bits.
// La clé privée est chiffrée avec AES-256-CBC en utilisant la phrase de passe fournie.
function generateRSAKeys(passphrase) {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passphrase
        }
    });
}

// Fonction pour chiffrer les données avec une clé publique RSA
// Cette fonction prend des données en clair et les chiffre avec une clé publique RSA.
// Les données chiffrées sont encodées en base64 avant d'être renvoyées.
function encryptWithPublicKey(data, publicKey) {
    const bufferData = Buffer.from(data, 'utf8');
    const encryptedData = crypto.publicEncrypt(publicKey, bufferData);
    return encryptedData.toString('base64');
}

// Fonction pour déchiffrer les données avec une clé privée RSA
// Cette fonction prend des données chiffrées, une clé privée RSA et la phrase de passe correspondante.
// Les données sont déchiffrées en utilisant la clé privée RSA avec la phrase de passe fournie.
// Les données déchiffrées sont renvoyées sous forme de chaîne UTF-8.
function decryptWithPrivateKey(encryptedData, privateKey, passphrase) {
    const bufferEncryptedData = Buffer.from(encryptedData, 'base64');
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            passphrase: passphrase
        },
        bufferEncryptedData
    );
    return decryptedData.toString('utf8');
}
//-------------------------------------------------------------------<<<

module.exports = {
    encryptDataAES,
    decryptDataAES,
    generateRSAKeys,
    encryptWithPublicKey,
    decryptWithPrivateKey
}



/*

>>>>>>>>>>>>>>   Exemple d'utilisation du cryptage asymétrique   <<<<<<<<<<<<<<<<

const { generateRSAKeys, encryptWithPublicKey, decryptWithPrivateKey } = require('./encryptdata');

//Nous avons récupéré la clé sécurisée de env
const passphrase = process.env.MYPASSPHRASE;

// Génère une paire de clés RSA en utilisant la phrase d'authentification.
const { publicKey, privateKey } = generateRSAKeys(passphrase);

// ID de l'utilisateur ou données que vous souhaitez masquer
const userId = _id;

// Chiffre l'identifiant de l'utilisateur à l'aide de la clé publique
const encryptedUserId = encryptWithPublicKey(userId, publicKey);

console.log('Identifiant crypté de l'utilisateur :', encryptedUserId);

// Vous pouvez maintenant stocker encryptedUserId en toute sécurité dans votre base de données ou ailleurs.

// Pour obtenir l'identifiant original, décrypter encryptedUserId à l'aide de la clé privée.
const decryptedUserId = decryptWithPrivateKey(encryptedUserId, privateKey, passphrase);

console.log('ID de l'utilisateur initial :', decryptedUserId);


*/