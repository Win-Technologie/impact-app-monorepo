// // multer.js
// // const multer = require('multer');

// // Configuration de Multer pour les avatars des utilisateurs
// const avatarStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/users/photos'); // Dossier de destination pour les avatars des utilisateurs
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         console.log(uniqueSuffix);
//         cb(null, 'avatar-' + uniqueSuffix); // Nom de fichier de l'avatar
//     }
// });
// const avatarUpload = multer({ storage: avatarStorage });

// // Paramètres Multer pour les images de voitures
// const carImageStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/cars/photos'); // Carpeta de destino para imágenes de autos
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'car-image-' + uniqueSuffix); // Nom de fichier de l'image auto
//     }
// });
// const carImageUpload = multer({ storage: carImageStorage });


// module.exports = {
//     avatarUpload,
//     carImageUpload
// };
