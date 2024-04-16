const mongoose = require('mongoose');

// Schéma de l'assurance
const assuranceSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  insuranceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  insuranceCompany: {
    type: String,
    required: true
  },
  subscriber: {
    type: String,
    required: true
  },
  subscriberPhone: {
    type: String,
    required: true
  },
  subscriberAddress: {
    type: String,
    required: true
  },
  subscriberFullName: {
    type: String,
    required: true
  },
  vehicle: {
    type: String,
    ref: 'Vehicle',
    required: true
  },
  vehicleRegistrationNumber: {
    type: String,
    required: true
  },
  vehicleBrand: {
    type: String,
    required: true
  },
  vehicleModel: {
    type: String,
    required: true
  },
  vehicleYear: {
    type: Number,
    required: true
  },
  // Apres discussion avec le front, on a décidé de ne pas utiliser le numéro de police 
  // policyNumber: {
  //   type: String,
  //   required: true
  // },
  // Apres discussion avec le front, on a décidé de ne pas utiliser le type de couverture
  //   coverageType: {
  //   type: String,
  //   required: true
  // },
  // Pas de startDate car l'assurance est effective dès sa création 
  // startDate: {
  //   type: Date,
  //   required: true
  // },
  expirationDate: {
    type: Date,
    required: true
  },
  documents: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    // required: true,
    default: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Modèle Assurance basé sur le schéma
const Assurance = mongoose.model('assurances', assuranceSchema);

module.exports = Assurance;
