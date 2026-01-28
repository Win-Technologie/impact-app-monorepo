const fs = require("fs");
const path = require("path");
const tesseract = require("tesseract.js");
const { createWorker, createScheduler } = require("tesseract.js");
// const natural = require('natural');
// const tokenizer = new natural.WordTokenizer();
// const pos = new natural.BrillPOSTagger();

//Get FilePath from files.
function getFilePath(file, numSegments) {
  const filePath = file.path;
  // console.log("filePath: ", filePath);
  const fileSplit = filePath.replace(/\\/g, "/").split("/");

  // Si le nombre de segments demandés est supérieur au nombre de segments dans le chemin,
  // nous renvoyons le chemin complet
  if (numSegments >= fileSplit.length) {
    return filePath;
  }

  // Sinon, nous ne renvoyons que les premiers numSegments.
  return fileSplit.slice(0, numSegments).join("/");
}

// get doc name from path.
function getFileName(file) {
  const filePath = file.path;
  // Obtenir un nom de fichier séparé par des
  // barres obliques inverses (Windows) ou des barres obliques inverses (Unix)
  const fileParts = filePath.split(/[\\/]/);
  // Récupère le dernier élément du tableau, qui est le nom du fichier
  const fileName = fileParts[fileParts.length - 1];
  // console.log(fileName)
  return fileName;
}

// Fonction permettant de supprimer les fichiers récemment téléchargés
const deleteUploadedFiles = (files) => {
  // Vérifie si aucun fichier n'est fourni, si c'est le cas, sort de la fonction
  if (!files) return;
  // Itère sur les valeurs des propriétés de l'objet files
  Object.values(files).forEach((file) => {
    // Vérifie si le fichier est une liste (tableau) de fichiers
    if (Array.isArray(file)) {
      // Si c'est une liste de fichiers, itère sur chaque fichier
      file.forEach((f) => {
        // Supprime physiquement le fichier en utilisant fs.unlink
        fs.unlink(f.path, (err) => {
          // Gère les éventuelles erreurs lors de la suppression du fichier
          if (err) {
            // Affiche un message d'erreur s'il y a une erreur lors de la suppression du fichier
            console.error(
              `Erreur lors de la suppression du fichier ${f.path}: ${err}`,
            );
          } else {
            // Affiche un message de succès si le fichier est supprimé avec succès
            console.log(`Fichier ${f.path} supprimé avec succès.`);
          }
        });
      });
    } else {
      // Si le fichier n'est pas une liste, supprime le fichier spécifié par file.path
      fs.unlink(file.path, (err) => {
        // Gère les éventuelles erreurs lors de la suppression du fichier
        if (err) {
          // Affiche un message d'erreur s'il y a une erreur lors de la suppression du fichier
          console.error(
            `EErreur de suppression du fichier ${file.path}: ${err}`,
          );
        } else {
          // Affiche un message de succès si le fichier est supprimé avec succès
          console.log(`Fichier ${file.path} supprimé avec succès.`);
        }
      });
    }
  });
};

// Vérifie la taille des fichiers dans une requête multipart/form-data
const checkFileSize = (files) => {
  //    console.log("Checking file sizes...");
  // Vérifie s'il n'y a pas de fichiers ou si la liste de fichiers est vide.
  if (!files || Object.keys(files).length === 0) {
    // Il n'y a pas de fichiers, la limite de taille est donc respectée.
    return { isValid: true, fileName: null };
  }
  // Définit la taille maximale des fichiers autorisée en octets (2MB).
  //const maxSizeBytes = 2 * 1024 * 1024; // 2MB en bytes
  const maxSizeBytes = 500 * 1024; // KB
  // Convertit l'objet de fichiers en un tableau de paires [clé, valeur].
  const filesArray = Object.entries(files);
  // Parcourt chaque fichier dans le tableau de fichiers.
  for (const [fileName, file] of filesArray) {
    // Vérifie si la taille du fichier dépasse la taille maximale autorisée.
    if (file.size > maxSizeBytes) {
      // La taille d'un fichier dépasse la limite.
      return { isValid: false, fileName };
    }
  }

  // Tous les fichiers respectent la limite de taille.
  return { isValid: true, fileName: null };
};

const checkFileQuantity = (files, maxAllowed) => {
  // console.log("Checking file quantity...");

  // Vérifier s'il n'y a pas de fichiers ou si la liste des fichiers est vide.
  if (!files || Object.keys(files).length === 0) {
    // Il n'y a pas de fichiers, le nombre de fichiers est valide.
    return { isValid: true };
  }

  // Vérifier si le nombre de fichiers dépasse la limite autorisée.
  if (Object.keys(files).length > maxAllowed) {
    // Le nombre de fichiers dépasse la limite.
    return { isValid: false, maxAllowed };
  }

  // Le nombre de fichiers est valide et se situe dans la limite autorisée.
  return { isValid: true };
};

// GET TEXT INFORMATION FROM AN IMAGE
async function processDocument(file) {
  try {
    // Vérifier si le fichier est une image
    const fileInfo = path.parse(file.originalFilename);
    const extension = fileInfo.ext.toLowerCase();

    // Liste des extensions d'images supportées
    const imageExtensions = [".jpg", ".jpeg", ".png"];

    if (imageExtensions.includes(extension)) {
      // Traiter l'image à l'aide de tesseract.js
      const imagePath = file.path;

      // Configurar tesseract para utilizar múltiples workers
      tesseract.workerOptions = {
        workerPath: "tesseract.js-worker.js", // Ruta al worker de tesseract.js
        numberOfWorkers: 4, // Número de workers a utilizar (puedes ajustarlo según tu CPU)
        path: "tesseract", // Ruta al ejecutable de Tesseract (opcional, si no está en el PATH)
      };

      // Reconocer texto en la imagen
      const {
        data: { text },
      } = await tesseract.recognize(imagePath);

      return text;
    } else {
      // Si el formato no está soportado, devuelve un mensaje de error.
      return "Incompatible_format";
    }
  } catch (error) {
    console.error("Erreur de traitement du document :", error);
    throw new Error("Erreur de traitement du document");
  }
}

// PROCESS INFORMATION FROM A DOCUMENT
// Fonction permettant de traiter le texte extrait du permis de conduire
function processLicenseText(text) {
  if (!text || typeof text !== "string") {
    console.error("Invalid input text");
    return {};
  }

  const information = {};

  // REGULAR EXPRESIONS
  // Nombre y Apellido
  const nameRegex = /\d\s*([^0-9\n]+)\s+(\w+)\s*(?=\n)/;
  const nameMatches = text.match(nameRegex);
  if (nameMatches) {
    information.firstName = nameMatches[2].trim();
    information.lastName = nameMatches[1].trim();
  }

  // const nameRegex01 = /\d\s*([^0-9\n]+)\s+(\w+)\s*(?=\n)/
  // const nameRegex01 = /\d\s*([^0-9\n]+)\s+([^0-9\n]+)\n/;
  // const nameRegex01 = /\d\s*([^\n]+)\s([^\n]+)\n/;
  // const nameRegex01 =  /\d\s*([^\n]+)\n\d\s*([^\n]+)/;
  const nameRegex01 = /\d\s*([^0-9\n]+)\n2\s*([^0-9\n]+)/;
  const nameMatche01 = text.match(nameRegex01);
  if (nameMatche01) {
    information.firstName1 = nameMatche01[2].trim();
    information.lastName1 = nameMatche01[1].trim();
  }

  // Fecha de nacimiento
  const dobRegex = /Date de naissance \(A-M-J\) : (\d{4}-\d{2}-\d{2})/;
  const dobMatch = text.match(dobRegex);
  if (dobMatch) {
    information.birthDate = dobMatch[1];
  }

  // Dirección
  const addressRegex =
    /\d+,\s*([^\n]+)\n+\s*f\s*([^\n]*)\n-\s*([^\n]*)\n-\s*([^\n]*)\n/;
  const addressMatches = text.match(addressRegex);
  if (addressMatches) {
    const [, address, app, city, zip] = addressMatches;
    information.address = [address.trim(), app.trim(), city.trim()]
      .filter(Boolean)
      .join(", ");
    // information.zipCode = zip.trim();
  }

  // Clase de licencia
  const licenseClassRegex = /Classe\(s\) (.+?)\n/;
  const licenseClassMatch = text.match(licenseClassRegex);
  if (licenseClassMatch) {
    information.licenseClass = licenseClassMatch[1];
  }

  // Sexo
  const genderRegex = /— Sexe\s*:\s*([^\n]+)/;
  const genderMatch = text.match(genderRegex);
  if (genderMatch) {
    information.gender = genderMatch[1];
  }

  // Condiciones
  const conditionsRegex = /Cond\.\s*:\s*(\w+)/;
  const conditionsMatch = text.match(conditionsRegex);
  if (conditionsMatch) {
    information.conditions = conditionsMatch[1];
  }

  // Altura
  const heightRegex = /Taille \(cm\) : (\d+)/;
  const heightMatch = text.match(heightRegex);
  if (heightMatch) {
    information.height = heightMatch[1];
  }

  // Menciones
  const mentionsRegex = /Mention\(s\) : (\w+)/;
  const mentionsMatch = text.match(mentionsRegex);
  if (mentionsMatch) {
    information.mentions = mentionsMatch[1];
  }

  // Color de ojos
  const eyeColorRegex = /Yeux\s*:\s*([^\n]+)/;
  const eyeColorMatch = text.match(eyeColorRegex);
  if (eyeColorMatch) {
    information.eyeColor = eyeColorMatch[1];
  }

  // Número de referencia
  const referenceNumberRegex = /N° de référence: (\w+)/;
  const referenceNumberMatch = text.match(referenceNumberRegex);
  if (referenceNumberMatch) {
    information.referenceNumber = referenceNumberMatch[1];
  }

  const referenceNumberRegex01 = /N° de référence:\s*(\w+)/;
  const referenceNumberMatch01 = text.match(referenceNumberRegex01);
  if (referenceNumberMatch01) {
    information.referenceNumber1 = referenceNumberMatch01[1];
  }

  // Validez de la licencia - Fecha de inicio
  const validityStartRegex = /Valide le\s*:\s*(\d{4}-\d{2}-\d{2})/;
  const validityStartMatch = text.match(validityStartRegex);
  if (validityStartMatch) {
    information.validityStart = validityStartMatch[1];
  }

  // // Validez de la licencia - Fecha de expiración
  // const validityEndRegex = /Expire le\s*:\s*(\d{4}-\d{2}-\d{2})/;
  // const validityEndMatch = text.match(validityEndRegex);
  // if (validityEndMatch) {
  //     information.validityEnd = validityEndMatch[1];
  // }

  // Validez de la licencia - Fecha de expiración
  const validityEndRegex = /Expire le\s*:?\s*(\d{4}-\d{2}-\d{2})/;
  const validityEndMatch = text.match(validityEndRegex);
  if (validityEndMatch) {
    information.validityEnd = validityEndMatch[1];
  }

  const expiryDateRegex =
    /Expire le\s*:?\s*(\d{4}-\d{2}-\d{2})\s*(\d{4}-\d{2}-\d{2})?/;
  const expiryDateMatch = text.match(expiryDateRegex);
  if (expiryDateMatch) {
    information.expiryDate = expiryDateMatch[1];
  }

  return information;
}

function processInsuranceText(text) {
  if (!text || typeof text !== "string") {
    console.error("Invalid input text");
    return {};
  }

  const info = {};

  // Nombre y dirección de la compañía de seguros
  const companyRegex =
    /NOM ET ADRESSE DE LA COMPAGNIE\n([^]+?)NAME AND ADDRESS OF INSURANCE COMPANY ([^]+?)DARRURANGE\n/;
  const companyMatches = text.match(companyRegex);
  if (companyMatches) {
    info.insuranceCompany = companyMatches[2].trim();
    info.companyAddress = companyMatches[1].trim();
  }

  // Nombre y dirección del asegurado
  const insuredRegex = /NOM ET ADDRESSE DE ASSURE\n([^]+?)INSURED VEHICLE/;
  const insuredMatches = text.match(insuredRegex);
  if (insuredMatches) {
    info.insuredNameAddress = insuredMatches[1].trim();
  }

  // Detalles del vehículo asegurado
  const vehicleRegex =
    /VEHICULE ASSURE “ ANNEE, MARQUE,\n([^]+?)EFFECTIVE DATE/;
  const vehicleMatches = text.match(vehicleRegex);
  if (vehicleMatches) {
    info.vehicleDetails = vehicleMatches[1].trim();
  }

  // Fechas de vigencia
  const datesRegex =
    /EFFECTIVE DATE DATE DENTREE EN VIGUEUR (\d+-[a-zA-Z]+-[\d]+) DATE OF EXPIRY DATE D'EXPIRATION (\d+-[a-zA-Z]+-[\d]+)/;
  const datesMatches = text.match(datesRegex);
  if (datesMatches) {
    info.effectiveDate = datesMatches[1].trim();
    info.expirationDate = datesMatches[2].trim();
  }

  // Número de póliza y agente
  const policyRegex =
    /POLICY NUMBER - POLICE NUMERO ([^]+?)AGENT\n([^]+?)NOM ET ADRESSEE DE LA COMPAGNIE/;
  const policyMatches = text.match(policyRegex);
  if (policyMatches) {
    info.policyNumber = policyMatches[1].trim();
    info.agent = policyMatches[2].trim();
  }

  return info;
}

module.exports = {
  getFilePath,
  getFileName,
  deleteUploadedFiles,
  checkFileSize,
  checkFileQuantity,
  processDocument,
  processLicenseText,
  processInsuranceText,
};

/*
async function processDocument01(file) {
    try {
        // Vérifier si le fichier est une image
        const fileInfo = path.parse(file.originalFilename);
        const extension = fileInfo.ext.toLowerCase();

        // Liste des extensions d'images supportées
        const imageExtensions = ['.jpg', '.jpeg', '.png'];

        if (imageExtensions.includes(extension)) {
            // Traiter l'image à l'aide de tesseract.js
            const imagePath = file.path;
            const { data: { text } } = await tesseract.recognize(imagePath);
            return text;
        } else {
            // Si le format n'est pas pris en charge, un message d'erreur est renvoyé.
            return 'Incompatible_format';
        }
    } catch (error) {
        console.error('Erreur de traitement du document :', error);
        throw new Error('Erreur de traitement du document');
    }
}

*/

// async function processDocument(file) {

//     try {
//         const imagePath = file.path;
//         console.log(imagePath);
//         // Procesar el documento utilizando tesseract.js
//         const { data: { text } } = await tesseract.recognize(imagePath);
//         return text;
//     } catch (error) {
//         console.error('Error al procesar el documento:', error);
//         throw new Error('Error al procesar el documento');
//     }
// }

// async function processDocument(file) {
//     try {
//         // Verificar si el archivo es una imagen o un PDF
//         const extension = extname(file.name).toLowerCase();

//         if (extension === '.pdf') {
//             // Procesar el documento PDF
//             const pdfPath = file.path;
//             const text = await extractTextFromPDF(pdfPath);
//             return text;
//         } else if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
//             // Procesar la imagen utilizando tesseract.js
//             const imagePath = file.path;
//             const { data: { text } } = await tesseract.recognize(imagePath);
//             return text;
//         } else {
//             // Si el formato no es compatible, lanzar un error
//             throw new Error('Formato de archivo no compatible');
//         }
//     } catch (error) {
//         console.error('Error al procesar el documento:', error);
//         throw new Error('Error al procesar el documento');
//     }
// }

// async function processDocument(file) {
//     try {
//         // Verificar si el archivo es una imagen o un PDF
//         // console.log(file);
//         // const extension = extname(file.name).toLowerCase();
//         console.log(file);
//         const fileInfo = path.parse(file.originalFilename);
//         const extension = fileInfo.ext.toLowerCase();
//         // console.log("extention : " , extension);

//         if (extension === '.pdf') {
//             // Procesar el documento PDF
//             const pdfPath = file.path;
//             const text = await extractTextFromPDF(pdfPath);
//             return text;
//         } else if (extension === '.jpg' || extension === '.jpeg' || extension === '.png') {
//             // Procesar la imagen utilizando tesseract.js
//             const imagePath = file.path;
//             const { data: { text } } = await tesseract.recognize(imagePath);
//             return text;
//         } else {
//             // Si el formato no es compatible, devolver un mensaje de error
//             return 'Incompatible_format';
//         }
//     } catch (error) {
//         console.error('Error al procesar el documento:', error);
//         throw new Error('Error al procesar el documento');
//     }
// }

// // Función para extraer texto de un documento PDF
// function extractTextFromPDF(pdfPath) {
//     console.log('pdf function format')
//     return new Promise((resolve, reject) => {
//         // Leer el contenido del archivo PDF
//         fs.readFile(pdfPath, (err, data) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 // Convertir el contenido del PDF a texto utilizando tesseract.js
//                 tesseract.recognize(data, { lang: 'eng' })
//                     .then(result => resolve(result.data.text))
//                     .catch(err => reject(err));
//             }
//         });
//     });
// }
//
