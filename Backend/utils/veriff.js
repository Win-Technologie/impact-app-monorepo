const jwt = require('../utils/jwt');

const { getDb } = require('../mongoConnection');

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');
const got = require('got');
const crypto = require('crypto');


// VARIABLES
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const BASE_VERIFF_HTTPS = process.env.BASE_VERIFF_HTTPS;
const VERIF_API_PUBLIC_KEY = process.env.VERIF_API_PUBLIC_KEY;
const VERIFF_FULL_API_PATH = process.env.VERIFF_FULL_API_PATH;
const X_HMAC_SIGNATURE = process.env.X_HMAC_SIGNATURE;
const VERIFF_BASE_URL = process.env.VERIFF_BASE_URL;

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);


async function getSessionDecision(sessionId) {
    try {

        const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}/decision`;
        // Construire le payload en tant que sessionId
        const payload = sessionId;
        // Construire le message à signer
        const message = payload;
        //// Générer une signature HMAC à l'aide de la clé partagée
        const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

        // Configurer les en-têtes de la requête
        const headers = {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY
        };

        // Configurer les options de l'application
        const options = {
            headers: headers,
            responseType: 'json'
        };

        try {
            // Effectuer la demande auprès de l'API Veriff
            const response = await got(url, options);
            // Renvoie les headers et corps de la réponse
            return ({ headers: response.headers, body: response.body });

        } catch (error) {
            console.error('Error:', error.response.body);
            throw new Error(error);
        }

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function generateHMACSignature(message, sharedSecretKey) {
    const hmac = crypto.createHmac('sha256', sharedSecretKey);
    hmac.update(message);
    return hmac.digest('hex');
}

function isSignatureValid({ signature, shared_secret_key, payload }) {
    try {
        if (!signature || !shared_secret_key || !payload) {
            throw new Error('Missing required parameters');
        }

        if (typeof payload === 'object') {
            payload = JSON.stringify(payload);
        }

        const digest = crypto
            .createHmac('sha256', shared_secret_key)
            .update(payload)
            .digest('hex');

        return digest === signature;
    } catch (error) {
        console.error('Error validating signature:', error);
        return false;
    }
}

async function ActivateUser(verificationId) {

    try {

        let myUser = await userCollection.findOne({ sessionId: verificationId });

        if (!myUser) {
            return ({ success: false, msg: "User verification ID doesn't exist" });
        }

        // userCollection.updateOne(
        //     { sessionId: verificationId },
        //     { $set: { driverLicense: newDriverLicense._id } }
        // ),

        // userCollection.updateOne(
        //     { sessionId: verificationId },
        //     { $set: {
        //          driverLicense: newDriverLicense._id,
        //         //  verifStatus: "approved",
        //          verifAproved: true,
        //          verifCheckDecision: "approved"
        //         } }
        // );

        return ({ success: true, msg: "Success" });

    } catch (error) {
        throw new error(error);
    }
}


module.exports={
    getSessionDecision,
    generateHMACSignature,
    isSignatureValid,
    ActivateUser

}