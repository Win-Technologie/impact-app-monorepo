// const mongoose = require('mongoose');
// const Immatriculation = require('../immatriculation/immatriculation');

// // Schéma du véhicule
// const vehicleSchema = new mongoose.Schema({
//   _id: {
//     type: String,
//     required: true
//   },
//   immatriculation: {
//     type: Object,
//     required: true
//   },
//   brand: {
//     type: String,
//     required: true,
//     index: true
//   },
//   model: {
//     type: String,
//     required: true,
//     index: true
//   },
//   year: {
//     type: Number,
//     required: true
//   },
//   color: {
//     type: String,
//     required: true,
//     index: true
//   },
//   plate: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   photo: {
//     type: String
//   },
//   assurance: {
//     type: String,
//     ref: 'Assurance'
//   },
//   serialNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   owner: {
//     type: String,
//     ref: 'User',
//     required: true
//   },
//   documents: {
//     type: Array
//   },
//   isActive: {
//     type: Boolean,
//     required: true,
//     default: true
//   },
//   dateAdded: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Modèle Vehicle basé sur le schéma
// const Vehicle = mongoose.model('vehicles', vehicleSchema);

// module.exports = Vehicle;
const mongoose = require('mongoose');

// Schéma de l'immatriculation
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



// Schéma du véhicule
const vehicleSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  immatriculation: {
    type: immatriculationSchema,
    required: true
  },
  brand: {
    type: String,
    required: true,
    index: true
  },
  model: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true,
    index: true
  },
  plate: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  photo: {
    type: String
  },
  assurance: {
    type: String,
    ref: 'Assurance'
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  owner: {
    type: String,
    ref: 'User',
    required: true
  },
  documents: {
    type: Array
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Modèle Vehicle basé sur le schéma
const Vehicle = mongoose.model('vehicles', vehicleSchema);

module.exports = Vehicle;