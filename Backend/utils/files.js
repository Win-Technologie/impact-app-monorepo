const fs = require('fs');
const path = require('path');

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


module.exports = {
    getFilePath,
    getFileName,
    deleteUploadedFiles,
    checkFileSize,
    checkFileQuantity
}