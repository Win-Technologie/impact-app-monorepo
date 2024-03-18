// Ce fichier gère la connexion à une base de données MongoDB à l'aide de MongoDB Atlas.
// Il exporte deux fonctions réutilisables : connectToMongo pour établir la connexion,
// et getDb pour obtenir une référence à une base de données spécifique.
const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://dbUser:Bp3itnn32VCGBdeX@ladb.opiabpu.mongodb.net/';
const client = new MongoClient(url, { maxPoolSize: 20000 });

// Connexion réutilisable
const connectToMongo = async () => {
  try {
    await client.connect();
    console.log('Connected to the database');
    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

const getDb = (dbName) => client.db(dbName);

module.exports = { connectToMongo, getDb };
