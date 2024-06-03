const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// schema for witnesses
const WitnessSchema = new Schema({
    name: String,
    phone: String,
    address: String,
    is_vehicle_passenger: { type: String, enum: ['A', 'B', 'NON'] },
    is_pedestrian: { type: String }
});
// main schema for accident report
const AccidentSchema = new Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true,
        index: true
    },
    accidentDate: Date,
    hourAccident: Date, // TO CHECK ALSO AUTOMATIC
    accidentLocation: String,
    vehicleADamage: Boolean,
    vehicleADamageDescription: String,
    vehicleBDamage: Boolean,
    vehicleBDamageDescription: String,
    injuredVehicleA: Boolean,
    injuredDescriptionVehicleA: String,
    injuredVehicleB: Boolean,
    injuredDescriptionVehicleB: String,
    witnesses: [WitnessSchema],
    vehicleA: {
        personalDetails: {
            name: String,
            lastName: String,
            address: String,
            phone: String,
            postalCode: String,
            email: String,
            city: String,
            province: String,
            country: String,
            user: {
                type: String,
                ref: 'User',
                index: true
            }
        },

        drivingLicense: {
            number: String,
            issuanceDate: Date,
            licenseClass: String,
            expirationDate: Date,
            driverLicenseId: {
                type: String,
                ref: 'DriverLicense',
                index: true
            }
        },
        registrationCertificate: {
            fileNumber: String,
            // owner: Boolean,
            // ownerName: String,
            // address: String,
            //    // city: String,
            //     postalCode: String,
            // phone: String,
            vehicleBrand: String,
            year: String,
            vehicleSerialNumber: String,
            licensePlateNumber: String,
            dateDelivrance: Date,
            vehicleId: {
                type: String,
                ref: 'immatriculations',
                index: true
            }
        },
        insuranceCertification: {
            insuranceCompany: String,
            policyNumber: String,
            effectiveDate: Date,
            insuredName: String,
            insuredLastName: String,
            insuredAddress: String,
            insuredCity: String,
            insuredPhone: String,
            assuranceId: {
                type: String,
                ref: 'assurances',
                index: true
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
            email: String,
            user: {
                type: String,
                ref: 'User',
                index: true
            }
        },

        drivingLicense: {
            issuanceDate: Date,
            expirationDate: Date,
            driverLicense: {
                type: String,
                ref: 'DriverLicense',
                index: true
            }
        },
        registrationCertificate: {
            fileNumber: String,
            owner: Boolean,
            ownerName: String,
            address: String,
            city: String,
            postalCode: String,
            phone: String,
            vehicleBrand: String,
            year: String,
            vehicleSerialNumber: String,
            licensePlateNumber: String,
            issuanceDate: Date,
            driverLicense: {
                type: String,
                ref: 'immatriculations',
                index: true
            }
        },
        insuranceCertification: {
            policyNumber: String,
            effectiveDate: Date,
            insuredName: String,
            insuredLastName: String,
            insuredAddress: String,
            insuredCity: String,
            insuredPhone: String,
            assurance: {
                type: String,
                ref: 'assurances',
                index: true
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



