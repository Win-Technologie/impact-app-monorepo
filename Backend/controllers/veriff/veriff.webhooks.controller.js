const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');
const got = require('got');
const crypto = require('crypto');


// VARIABLES
const ONFIDO_API_TOKEN = process.env.ONFIDO_API_TOKEN;
const MAINDB = process.env.MAINDB;
const USERSCOLLECTION = process.env.USERSCOLLECTION;
const DOCPATH = process.env.USER_CONTROLLER_IMG_PATHX2;
const CONNECTION_PATH = process.env.BASE_PATH;
const PORT = process.env.PORT;
const DOCBASICPATH = process.env.USER_DOC_PATH;
const BASE_VERIFF_HTTPS = process.env.BASE_VERIFF_HTTPS;
const VERIF_API_PUBLIC_KEY = process.env.VERIF_API_PUBLIC_KEY;
const VERIFF_FULL_API_PATH = process.env.VERIFF_FULL_API_PATH;
const X_HMAC_SIGNATURE = process.env.X_HMAC_SIGNATURE;
const VERIFF_BASE_URL = process.env.VERIFF_BASE_URL;

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);

async function webhookDecisions(req, res) {
    try {
        
        // const hmacSignature = req.headers[X_HMAC_SIGNATURE];
        // const secretKey = VERIF_API_PUBLIC_KEY; 
        // const calculatedSignature = crypto.createHmac('sha256', secretKey)
        //     .update(JSON.stringify(req.body))
        //     .digest('hex');

        // if (hmacSignature !== calculatedSignature) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }

        const { verification } = req.body;
        const { status } = verification;

        let myResponse = '';

        switch (status) {
            case 'approved':
                // Acciones cuando la verificación es aprobada
                console.log('Verification approved :', verification.id);

                myResponse = ActivateUser(verification.id);

                break;
            case 'declined':
                // Acciones cuando la verificación es rechazada
                console.log('Verificación rechazada:', verification.id);
                break;
            case 'resubmission_requested':
                // Acciones cuando se solicita una nueva presentación
                console.log('Se solicita una nueva presentación:', verification.id);
                break;
            // Agrega casos para otros estados de verificación según sea necesario
            default:
                console.log('Estado de verificación no reconocido:', status);
        }

        // Enviar respuesta de confirmación
        if (!myResponse.success) {

            res.status(400).json({ error: myResponse.msg })
        }

        res.sendStatus(200);

    } catch (error) {
        //console.log(error);
        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
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

module.exports = {

    webhookDecisions,
};

