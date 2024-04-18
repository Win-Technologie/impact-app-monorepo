const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');
const got = require('got');
const crypto = require('crypto');

const { ActivateUser } = require('../../utils/veriff');

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
        const headers = req.headers;

        let myResponse = '';

        switch (status) {
            case 'approved':
                // Acciones cuando la verificación es aprobada
                console.log('Verification approved :', verification.id);
                myResponse = await ActivateUser(verification.id);

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

        if (!myResponse.success) {
            return res.status(400).json({ error: myResponse.msg });
        }

        res.sendStatus(200);

    } catch (error) {

        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}



/*
// async function ActivateUser(verificationId) {
//     try {
//         let myUser = await userCollection.findOne({ sessionId: verificationId });

//         if (!myUser) {
//             return { success: false, msg: "User session id does not exist" };
//         }

//         const updateResult = await userCollection.updateOne(
//             { sessionId: verificationId },
//             {
//                 $set: {
//                     verifStatus: "verified",
//                     verifAproved: true,
//                     verifCheckDecision: "approved"
//                 }
//             }
//         );

//         if (updateResult.modifiedCount > 0) {
//             return { success: true, msg: "Success" };
//         } else {
//             return { success: false, msg: "Failed to update user" };
//         }
//     } catch (error) {
//         throw new Error(error);
//     }
// }
*/


module.exports = {

    webhookDecisions,
};

