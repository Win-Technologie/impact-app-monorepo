const mongoose = require('mongoose');

// Schéma de l'immatriculation
// Pour l'instant utiliser celui de vehicule js
const immatriculationSchema = new mongoose.Schema({
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  issuanceDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  ESSIEUXNumber: {
    type: Number 
  },
  netWeight: {
    type: Number
  },
  engineDisplacement: {
    type: Number
  },
  dossierNumber: {
    type: String
  },
  usageCategory: {
    type: String
  }
});


// Modèle immatriculation basé sur le schéma
const Immatriculation = mongoose.model('immatriculations', immatriculationSchema);

module.exports = Immatriculation;
