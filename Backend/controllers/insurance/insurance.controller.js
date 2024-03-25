const { getDb } = require('../../mongoConnection');
const jwt = require('../../utils/jwt');
const { body, validationResult } = require('express-validator');
const Insurance = require('../../models/insurance/insurance');
const { myCache, encryptData, decryptData } = require("../../utils/cache");

const MAINDB = process.env.MAINDB;
const INSURANCES_COLLECTION = process.env.INSURANCES_COLLECTION;
const VEHICLES_COLLECTION = process.env.VEHICLES_COLLECTION;

const mainDb = getDb(MAINDB);
const insuranceCollection = mainDb.collection(INSURANCES_COLLECTION);
const vehicleCollection = mainDb.collection(VEHICLES_COLLECTION);