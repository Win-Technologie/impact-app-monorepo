const mongoose = require('mongoose');

// Schéma de l'assurance
const assuranceSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  insuranceNumber: { // Numéro d'assurance
    type: String,
    required: true,
    unique: true,
    index: true
  },
  insuranceCompany: { // Nom de la société d'assurance
    type: String,
    required: true
  },
  subscriber: { // Souscripteur de l'assurance
    type: String,
    required: true
  },
  subscriberPhone: { // Numéro de téléphone du souscripteur
    type: String,
    required: true
  },
  subscriberAddress: { // Adresse du souscripteur
    type: String,
    required: true
  },
  subscriberFullName: { // Nom complet du souscripteur
    type: String,
    required: true
  },
  vehicle: { // Référence au véhicule assuré
    type: String,
    ref: 'Vehicle',
    required: true
  },
  documents: [{ // Documents liés à l'assurance
    type: String
  }],
  isActive: { // Statut de l'assurance
    type: Boolean,
    required: true,
    default: true
  },
  dateAdded: { // Date d'ajout de l'assurance
    type: Date,
    default: Date.now
  }
});

// Modèle Assurance basé sur le schéma
const Assurance = mongoose.model('assurances', assuranceSchema);

module.exports = Assurance;
