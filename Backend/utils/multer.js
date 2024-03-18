// multer.js
const multer = require('multer');

// Configuración de multer para avatares de usuarios
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/users/photos'); // Carpeta de destino para avatares de usuarios
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        console.log(uniqueSuffix);
        cb(null, 'avatar-' + uniqueSuffix); // Nombre del archivo de avatar
    }
});
const avatarUpload = multer({ storage: avatarStorage });

// Configuración de multer para imágenes de autos
const carImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/cars/photos'); // Carpeta de destino para imágenes de autos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'car-image-' + uniqueSuffix); // Nombre del archivo de imagen de auto
    }
});
const carImageUpload = multer({ storage: carImageStorage });

// Exportar las instancias de multer
module.exports = {
    avatarUpload,
    carImageUpload
};
