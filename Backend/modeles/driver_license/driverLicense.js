const mongoose = require("mongoose");

const driverLicenseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    required: true,
    index: true,
  },
  user: {
    type: String,
    ref: "User",
    index: true,
  },
  number: {
    type: String,
    required: true,
    // minlength: 8
  },
  name: {
    type: String,
    required: true,
    // minlength: 3
  },
  lastName: {
    type: String,
    required: true,
    // minlength: 3
  },
  birthdate: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
    // minlength: 4
  },
  appartment: {
    type: String,
    // minlength: 2
  },
  country: {
    type: String,
    // required: true,
    // minlength: 2
    index: true,
  },
  province: {
    type: String,
    required: true,
    // minlength: 2
    index: true,
  },
  postalCode: {
    type: String,
    required: true,
    // minlength: 4
  },
  licenseClass: {
    type: String,
    required: true,
    // minlength: 1
  },
  sex: {
    type: String,
    required: true,
    // minlength: 1
  },
  rest: {
    type: String,
    required: true,
    // minlength: 2
  },
  mention: {
    type: String,
    required: true,
    // minlength: 2
  },
  referenceNumber: {
    type: String,
    // minlength: 4
  },
  height: {
    type: String,
    // minlength: 2
  },
  weight: {
    type: String,
    // minlength: 2
  },
  issued: {
    type: Date,
    required: true,
    index: true,
  },
  expires: {
    type: Date,
    required: true,
    index: true,
  },
  city: {
    type: String,
    required: true,
    index: true,
  },
  photoRecto: {
    type: String,
    required: true,
    index: true,
  },
  photoVerso: {
    type: String,
    required: true,
    index: true,
  },
  photoSelfie: {
    type: String,
    required: true,
    index: true,
  },
  // ,
  // photo: {
  //     front: {
  //         type: String,
  //         required: true
  //     },
  //     back: {
  //         type: String,
  //         required: true
  //     }
  // }
});

const DriverLicense = mongoose.model("DriverLicense", driverLicenseSchema);

module.exports = DriverLicense;
