const crypto = require("crypto");
const MYSECRETKEY = process.env.MYSECRETKEY;
const { decryptDataAES } = require("../utils/encryptdata");

function secureReq(req, res, next) {
  const encryptedKey = req.headers["win_connection"];

  // Verificar si la clave encriptada está presente en los headers
  if (!encryptedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Desencriptar la clave y extraer la información
  const decryptedKey = decryptDataAES(encryptedKey);

  // Verificar la validez de la clave
  if (!isValidKey(decryptedKey)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // La clave es válida, continuar con la solicitud
  next();
}

// Función para verificar la validez de la clave
function isValidKey(decryptedKey) {
  // Verificar si la clave contiene los valores esperados
  return (
    decryptedKey.includes("FrontImpactTechnologieByWinTech") &&
    decryptedKey.includes("frontend_impact")
  );
}

module.exports = {
  secureReq,
};
