const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');
const got = require('got');
const crypto = require('crypto');

const { ActivateUser, DeactivateUser, modifUserVeriffAttributes } = require('../../utils/veriff');

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
            case 'approved':  // Actions en cas d'approbation de la vérification

                console.log('Verification approved :', verification.id);
                // myResponse = await ActivateUser(verification.id);
                myResponse = await modifUserVeriffAttributes(verification.id, 'approved', 'verified', true)
                break;

            case 'declined': // Actions en cas de rejet de la vérification
                console.log('Verification rejected:', verification.id);
                // myResponse = await DeactivateUser(verification.id,'declined');
                myResponse = await modifUserVeriffAttributes(verification.id, 'declined', 'verified', false)
                break;

            case 'resubmission_required': // Actions en cas de demande de resoumission
                console.log('a new presentation is requested:', verification.id);
                break;

            case 'expired':
                // Actions en cas de soumission expired
                console.log('Verification expired', verification.id);
                myResponse = await DeactivateUser(verification.id, 'expired');
                break;

            case 'abandoned':
                // Actions en cas de soumission abandoned
                console.log('Verification abandoned', verification.id);
                myResponse = await DeactivateUser(verification.id, 'abandoned');
                break;

            case 'review':
                // Actions en cas de soumission review
                console.log('Verification review', verification.id);
                myResponse = await DeactivateUser(verification.id, 'review');
                break;

            // Ajouter des cas pour d'autres statuts de vérification si nécessaire...
            default:
                console.log('Unrecognized verification status:', status);
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

