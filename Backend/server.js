// Ce fichier configure et démarre un serveur Express pour une application Node.js.
// Il utilise plusieurs middleware tels que express, mongoose, passport, express-session, flash, cors, etc.
// La connexion à la base de données MongoDB est établie grâce à la fonction connectToMongo du fichier 'mongoConnection'.
// Les routes de l'application sont définies dans les fichiers 'routes/payments/payments.routes' et 'routes/projects/projects.routes'.
// Le serveur écoute sur le port défini par la variable d'environnement PORT ou sur le port 8000 par défaut.
require('dotenv').config(); // lecteur de variables d'environnement 
// MODULES
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const { connectToMongo } = require('./mongoConnection');
const { removeRevokedTokens } = require('./utils/jwt');

const app = express();
const PORT = process.env.PORT || 8000;
// TIMER
const MYCRONTIMER = process.env.CRONTIMER_EVERYHOUR;
// Routes
const userRoutes = require('./routes/user/user.routes');
const vehicleRoutes = require('./routes/vehicle/vehicle.routes');
// const insuranceRoutes = require('./routes/insurance/insurance.routes');
const onfidoRoutes = require('./routes/onfido/onfido.routes');

connectToMongo();

// // Express body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Augmentez la limite selon vos besoins
app.use(express.json({ limit: '10mb' })); // Augmentez la limite selon vos besoins

// // Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// // Configuration d'express-session
app.use(session({
    secret: 'votre_secret_session', // Remplacez par une chaîne aléatoire et sécurisée
    resave: true,
    saveUninitialized: true,
}));

// // Utilisation de CORS middleware
app.use(cors());

// // Express flash middleware
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Configuration pour utiliser les fichiers statiques du dossier "uploads".
app.use("/Backend/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/insurances', insuranceRoutes);
app.use('/api/onfido', onfidoRoutes);

// Programmation de tâches qui s'exécutent automatiquement après un certain laps de temps
cron.schedule(`${MYCRONTIMER}`, async () => {
    console.log('Exécution du nettoyage des tokens révoqués...');
    // await removeRevokedTokens();
    removeRevokedTokens()
        .then((result) => {
            if (result) {
                console.log('Les tokens révoqués ont été supprimés avec succès.');
            } else {
                console.log("Une erreur s'est produite lors de la suppression des tokens révoqués");
            }
        })
        .catch((error) => {
            console.error('Erreur lors de la suppression des tokens révoqués :', error);
        });

}, {
    scheduled: true,
    timezone: "America/New_York" // Régler le fuseau horaire en fonction de votre lieu de résidence
});


// Start the server
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
