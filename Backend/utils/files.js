const fs = require('fs');
const path = require('path');
const tesseract = require('tesseract.js');

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
    return fileName;
}

// Fonction permettant de supprimer les fichiers récemment téléchargés
const deleteUploadedFiles = (files) => {
    // Vérifie si aucun fichier n'est fourni, si c'est le cas, sort de la fonction
    if (!files) return;
    // Itère sur les valeurs des propriétés de l'objet files
    Object.values(files).forEach(file => {
        // Vérifie si le fichier est une liste (tableau) de fichiers
        if (Array.isArray(file)) {
            // Si c'est une liste de fichiers, itère sur chaque fichier
            file.forEach(f => {
                // Supprime physiquement le fichier en utilisant fs.unlink
                fs.unlink(f.path, (err) => {
                    // Gère les éventuelles erreurs lors de la suppression du fichier
                    if (err) {
                        // Affiche un message d'erreur s'il y a une erreur lors de la suppression du fichier
                        console.error(`Erreur lors de la suppression du fichier ${f.path}: ${err}`);
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
                    console.error(`EErreur de suppression du fichier ${file.path}: ${err}`);
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
    const maxSizeBytes = 500 * 1024;  // KB
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

// PROCESS INFORMATION FROM A DOCUMENT
// Fonction permettant de traiter le texte extrait du permis de conduire
function processLicenseText01(text) {

    console.log(text);
    // Dividir el texto en líneas
    const lines = text.split('\n');

    // Objeto para almacenar la información extraída
    const licenseInfo = {};

    // Expresiones regulares multilingües
    const nameRegex = /Nom|Name: (.+)/; // Busca "Nom" en francés o "Name" en inglés
    const licenseNumberRegex = /Numéro de permis|License Number: (.+)/; // Busca "Numéro de permis" en francés o "License Number" en inglés
    // Agrega más expresiones regulares para otros datos que deseas extraer

    // Iterar sobre cada línea y buscar coincidencias con las expresiones regulares
    lines.forEach(line => {
        const nameMatch = line.match(nameRegex);
        if (nameMatch) {
            licenseInfo.name = nameMatch[1]; // Almacena el nombre encontrado
        }

        const licenseNumberMatch = line.match(licenseNumberRegex);
        if (licenseNumberMatch) {
            licenseInfo.licenseNumber = licenseNumberMatch[1]; // Almacena el número de licencia encontrado
        }

        // Agrega más lógica para otras coincidencias de expresiones regulares
    });

    console.log(licenseInfo);
    // Devuelve el objeto con la información extraída
    return licenseInfo;
}

function processLicenseText(text) {
    try {
        // Dividir el texto en líneas
        const lines = text.split('\n');

        // Objeto para almacenar la información extraída
        const licenseInfo = {};

        // Expresiones regulares actualizadas
        // const nameRegex = /Nom|Name: (.+)/; // Busca "Nom" en francés o "Name" en inglés
        // const licenseNumberRegex = /Numéro de permis|License Number: (.+)/; // Busca "Numéro de permis" en francés o "License Number" en inglés
        // const classRegex = /Class:|Classe(s)|Classe (.+)/i; // Captura la clase del permiso
        // const sexRegex = /sex:|sexe: ([MF])/i; // Captura el sexo del titular (M o F)
        // const issuedRegex = /issued:|Valide le| valide de(\d{4}-\w{3}-\d{2})/i; // Captura la fecha de emisión
        // //const expiredRegex = /Expires|expires|Expire le|expire le|expire|Expire: (\d{4}-\w{3}-\d{2})/;
        // // const expiredRegex = /Expires|expires|Expire le|expire le|expire|Expire: (\d{4}-\w{3}-\d{2})/;
        // //const expiredRegex = /Expires|expire le:?|Expire le: (\d{4}-\w{3}-\d{2})/i;
        // const expiredRegex = /Expire\s*le\s*:\s*(\d{4}-\d{2}-\d{2})/i;
        // const cardTypeRegex = /TEST CARD ([A-Z0-9]+)$/; // Captura el tipo de tarjeta (por ejemplo, "DL:1234562")
        // const addressRegex = /^hl & (.+)/; // Captura la dirección

        const classRegex = /Classe\(s\)|Classe:|Class:(.+)/i; // Captura la clase del permiso
        const sexRegex = /sex[^\w]|sexe[^\w]:\s*([MF])/i; // Captura el sexo del titular (M o F)
        const issuedRegex = /issued:|Valide(?:\sle)?(?:\sde)?:\s*(\d{4}-\w{3}-\d{2})/i; // Captura la fecha de emisión
        const expiredRegex = /Expires|Expire[^\w]le[^\w]:(\d{4}-\w{3}-\d{2})/i; // Captura la fecha de expiración
        const addressRegex = /(\d{1,5}\s+[^\d,]+),\s*(.*?),\s*([A-Z]{2}\s*\d[A-Z]\s*\d[A-Z]\d)/i; // Captura la dirección y el código postal
        const cardTypeRegex = /TEST CARD\s([A-Z0-9]+)/i; // Captura el tipo de tarjeta (DL, etc.)
        const nameRegex = /Nom|Name: (.+)/; // Busca "Nom" en francés o "Name" en inglés


        // Iterar sobre cada línea y buscar coincidencias con las expresiones regulares
        lines.forEach(line => {
            const nameMatch = line.match(nameRegex);
            if (nameMatch) {
                licenseInfo.name = nameMatch[1].trim(); // Almacena el nombre encontrado
            }
            const expiredMatch = line.match(expiredRegex);
           // console.log(expiredRegex);
            // console.log(expiredMatch);
            if (expiredMatch && expiredMatch[1]) {
                licenseInfo.expirationDate = expiredMatch[1].trim();
            }
            

            const licenseNumberMatch = line.match(licenseNumberRegex);
            if (licenseNumberMatch) {
                licenseInfo.licenseNumber = licenseNumberMatch[1].trim(); // Almacena el número de licencia encontrado
            }

            const classMatch = line.match(classRegex);
            if (classMatch) {
                licenseInfo.class = classMatch[1].trim(); // Almacena la clase del permiso
            }

            const sexMatch = line.match(sexRegex);
            if (sexMatch) {
                licenseInfo.sex = sexMatch[1]; // Almacena el sexo del titular
            }

            const issuedMatch = line.match(issuedRegex);
            if (issuedMatch) {
                licenseInfo.issued = issuedMatch[1]; // Almacena la fecha de emisión
            }

            const cardTypeMatch = line.match(cardTypeRegex);
            if (cardTypeMatch) {
                licenseInfo.cardType = cardTypeMatch[1]; // Almacena el tipo de tarjeta (DL, etc.)
            }

            const addressMatch = line.match(addressRegex);
            if (addressMatch) {
                licenseInfo.address = addressMatch[1].trim(); // Almacena la dirección
            }
        });

        // Devuelve el objeto con la información extraída
        return licenseInfo;

    } catch (error) {
        console.error("Error processLicenseText", error);
    }
}

module.exports = {
    getFilePath,
    getFileName,
    deleteUploadedFiles,
    checkFileSize,
    checkFileQuantity,
    processDocument,
    processLicenseText
}



















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