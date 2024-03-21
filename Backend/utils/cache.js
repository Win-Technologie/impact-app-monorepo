const NodeCache = require('node-cache');
const crypto = require('crypto'); 

// instance de NodeCache
const myCache = new NodeCache({
    stdTTL: 600,
    checkperiod: 120
});

// Fonction pour crypter les données sensibles avec AES
function encryptData(data, key) {
  const iv = crypto.randomBytes(16); // Générer un vecteur d'initialisation aléatoire
  const jsonString = JSON.stringify(data); // Convertir l'objet en une chaîne JSON
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encryptedData = cipher.update(jsonString, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return iv.toString('hex') + encryptedData; // Concaténer l'IV avec les données chiffrées
}



// Fonction pour décrypter les données sensibles avec AES
function decryptData(encryptedData, key) {
  const iv = Buffer.from(encryptedData.slice(0, 32), 'hex'); // Récupérer l'IV à partir des données chiffrées
  const encryptedText = encryptedData.slice(32); // Récupérer les données chiffrées (après l'IV)
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return JSON.parse(decryptedData); // Convertir la chaîne JSON en objet JavaScript
}




module.exports = {
    myCache,
    encryptData,
    decryptData
};
