const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        required: true,
        index: true
    },
    active: {
        type: Boolean,
        default: false,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // driverLicense: {
    //     type: String,
    //     ref: 'Document',
    //     index: true
    // },
    // driverLicense: {
    //     licenseNumber: {
    //         type: String,
    //         ref: 'DriverLicense',
    //         required: true,
    //         index: true
    //     },
    //     expirationDate: {
    //         type: Date,
    //         required: true
    //     }
    // },
    address: {
        type: String
    },
    postalCode: {
        type: String
    },
    city: {
        type: String,
        index: true
    },
    province: {
        type: String,
        index: true
    },
    country: {
        type: String,
        index: true
    },
    gender: {
        type: String,
        index: true
    },
    birthDay: {
        type: Date
    },
    photo: {
        type: String
    },
    vehicles: [{
        type: String,
        ref: 'Vehicles',
        index: true
    }],
    // documents: [{
    //     type: String,
    //     ref: 'Document',
    //     index: true
    // }],
    documents: [{
        documentName: {
            type: String,
            required: true
        },
        documentId: {
            type: String,
            ref: 'Document',
            required: true
        }
    }],

    typeAccount: {
        type: String,
        enum: ['free', 'premium'],
        index: true
    },
    subscription: {
        type: String,
        ref: 'Subscription'
    },
    // typeAccount: {
    //     type: String,
    //     index: true
    // },
    allConditionsAccepted: {
        type: Boolean,
        default: false
    },
    accidentReports: [{
        type: String,
        ref: 'AccidentReport',
        index: true
    }],
    loginAttempts: {
        type: Number,
        default: 0,
        required: true,
    },
    // Campo para almacenar el código de verificación
    verificationCode: {
        type: String,
        default: null
    },
    // Campo para controlar el número de intentos fallidos
    verificationAttempts: {
        type: Number,
        default: 0
    },

    // Campo para controlar la fecha y hora de expiración del código
    verificationCodeExpiration: {
        type: Date,
        default: null
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
