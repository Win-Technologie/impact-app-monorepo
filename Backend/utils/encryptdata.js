const crypto = require('crypto');
const MYSECRETKEY = process.env.MYSECRETKEY;
const MYPRIVATEKEY = process.env.MYPRIVATEKEY;
const MYPUBLICSECRETKEY = process.env.MYPUBLICSECRETKEY;

// const salt = crypto.randomBytes(16).toString('hex');
const salt = "1j0i2h0g3f0e4d0c5b0a";

// Cryptage symétrique >>> ---------------------------------------------
// Dériver une clé de mot de passe à l'aide de PBKDF2
function deriveKeyFromPassword(password) {
    // const salt = crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

// Cryptage symétrique >>> ---------------------------------------------
// Fonction de cryptage des données avec AES
function encryptDataAES(data) {
    const iv = crypto.randomBytes(16); // Vector de inicialización aleatorio
    const key = deriveKeyFromPassword(MYSECRETKEY);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return { iv: iv.toString('hex'), ed:encryptedData };
}

// Fonction de décryptage des données avec AES
function decryptDataAES(encryptedData, iv) {
    const key = deriveKeyFromPassword(MYSECRETKEY, salt);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}
//-------------------------------------------------------------------<<<

// Cryptage asynmétrique >>> -------------------------------------------
// Fonction pour générer une paire de clés RSA avec une phrase de passe
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
function encryptWithPublicKey(data, publicKey) {
    const bufferData = Buffer.from(data, 'utf8');
    const encryptedData = crypto.publicEncrypt(publicKey, bufferData);
    return encryptedData.toString('base64');
}

// Fonction pour déchiffrer les données avec une clé privée RSA
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