const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for witnesses
const WitnessSchema = new Schema({
    name: String,
    phone: String,
    address: String,
    is_vehicle_passenger: { type: String, enum: ['A', 'B'] },
    is_pedestrian: { type: String }
});

// main schema for accident report
const AccidentSchema = new Schema({
    accidentDate: Date,
    accidentLocation: String,
    vehicleADamage: String,
    vehicleADamageDescription: String,
    vehicleBDamage: String,
    vehicleBDamageDescription: String,
    witnesses: [WitnessSchema],
    vehicleA: {
        personalDetails: {
            name: String,
            lastName: String,
            address: String,
            phone: String,
            postalCode: String,
            email: String
        },
        documents: {
            drivingLicense: {
                issuanceDate: Date,
                expirationDate: Date
            },
            registrationCertificate: {
                fileNumber: String,
                owner: String,
                address: String,
                city: String,
                postalCode: String,
                phone: String,
                vehicleBrand: String,
                year: String,
                vehicleSerialNumber: String,
                licensePlateNumber: String,
                issuanceDate: Date
            },
            insuranceCertification: {
                policyNumber: String,
                effectiveDate: Date,
                insuredName: String,
                insuredLastName: String,
                insuredAddress: String,
                insuredCity: String,
                insuredPhone: String
            }
        }
    },
    vehicleB: {
        personalDetails: {
            name: String,
            lastName: String,
            address: String,
            phone: String,
            postalCode: String,
            email: String
        },
        documents: {
            drivingLicense: {
                licenseNumber: String,
                issuanceDate: Date,
                expirationDate: Date
            },
            registrationCertificate: {
                fileNumber: String,
                isOwner: Boolean,
                owner: String,
                address: String,
                city: String,
                postalCode: String,
                phone: String,
                vehicleBrand: String,
                year: String,
                vehicleSerialNumber: String,
                licensePlateNumber: String,
                issuanceDate: Date
            },
            insuranceCertification: {
                policyNumber: String,
                effectiveDate: Date,
                insuredName: String,
                insuredLastName: String,
                insuredAddress: String,
                insuredCity: String,
                insuredPhone: String
            }
        }
    },
    accidentSketch: String,
    vehicleADamageComments: String,
    vehicleBDamageComments: String,
    vehicleATowed: Boolean,
    vehicleBTowed: Boolean,
    vehicleADriverSignature: String,
    vehicleBDriverSignature: String
});

// Create and export the model based on the schema
const Accident = mongoose.model('AccidentReport', AccidentSchema);
module.exports = Accident;


