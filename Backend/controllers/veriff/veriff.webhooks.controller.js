const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');
const got = require('got');
const crypto = require('crypto');

const { ActivateUser, DeactivateUser, modifAndGetUserVeriffAttributes } = require('../../utils/veriff');
const { sendNotificationMail } = require('../../utils/nodemailer');

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

let contactNumber01 = 'xxx-xxx-xx-xx'

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
        let htmlMessage = '';
        let subject = '';

        switch (status) {
            case 'approved':  // Actions en cas d'approbation de la vérification

                console.log('Verification approved :', verification.id);
                // myResponse = await ActivateUser(verification.id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'approved', 'verified', true);
                if (myResponse.success) {
                    htmlMessage = `<p>Hello ${myResponse.name}, welcome to the Impact family, your application has been approved, please go to the application to enjoy all the benefits</p>`;
                    subject = 'Approved verification';
                }

                break;

            case 'declined': // Actions en cas de rejet de la vérification
                console.log('Verification rejected:', verification.id);
                // myResponse = await DeactivateUser(verification.id,'declined');
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'declined', 'verified', false);
                htmlMessage = `<p>Hello ${myResponse.name}, We regret to inform you that your application has been denied, please contact technical support at ${contactNumber01} for more information</p>`;
                subject = 'Declined verification';

                break;

            case 'resubmission_required': // Actions en cas de demande de resoumission
                console.log('A new submission is requested:', verification.id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'resubmission_required', 'verified', false);
                htmlMessage = `<p>Please click the button below to resubmit your information:</p>
                                <a href=${myResponse.url} target="_blank">
                                <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px;">Verify me</button>
                                </a>
                               `;
                subject = 'Resubmission required';

                break; 

            case 'expired':
                // Actions en cas de soumission expired
                console.log('Verification expired', verification.id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'expired', 'verified', false);
                htmlMessage = `<p>Hello ${myResponse.name}, We regret to inform you that your application has been expired, please contact technical support at ${contactNumber01} for more information</p>`;
                subject = 'Verification expired';
                break;

            case 'abandoned':
                // Actions en cas de soumission abandoned
                console.log('Verification abandoned', verification.id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'abandoned', 'verified', false);
                htmlMessage = `<p>Hello ${myResponse.name}, We regret to inform you that your application has been abandoned, please contact technical support at ${contactNumber01} for more information</p>`;
                subject = 'Verification abandoned';
                break;

            case 'review':
                // Actions en cas de soumission review
                console.log('Verification review', verification.id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'review', 'verified', false);
                htmlMessage = `<p>Hello ${myResponse.name}, We inform you that your application is under review, we will keep you informed of any changes in the status of your account.</p>`;
                subject = 'Verification review';
                break;

            // Ajouter des cas pour d'autres statuts de vérification si nécessaire...
            default:
                console.log('Unrecognized verification status:', status);
        }

        if (!myResponse.success) {
            return res.status(400).json({ error: myResponse.msg });
        }

        res.sendStatus(200);

        await sendNotificationMail(myResponse.email,subject,htmlMessage);

    } catch (error) {

        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}

async function webHookEvents(req,res){

    try {
        
        // const hmacSignature = req.headers[X_HMAC_SIGNATURE];
        // const secretKey = VERIF_API_PUBLIC_KEY; 
        // const calculatedSignature = crypto.createHmac('sha256', secretKey)
        //     .update(JSON.stringify(req.body))
        //     .digest('hex');

        // if (hmacSignature !== calculatedSignature) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }

        const { id, attemptId, feature, code, action, vendorData } = req.body;
        // const { status } = verification;
        const headers = req.headers;

        // console.log(req.body);

        let myResponse = '';
        let htmlMessage = '';
        let subject = '';

        switch (code) {
            case 7001 :  // Actions en cas d'approbation de la vérification

                console.log('Action started :', id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'no-action', 'started', true);
                if (myResponse.success) {
                    htmlMessage = `<p>Hello ${myResponse.name}, Your verification process has begun, we will be in touch as soon as there is a change in your account status.</p>`;
                    subject = 'Verification started';
                }

                break;

            case 7002: // Actions en cas de rejet de la vérification
                console.log('Action submited ', id);
                myResponse = await modifAndGetUserVeriffAttributes(verification.id, 'no-action', 'submited', false);
                htmlMessage = `<p>Hello ${myResponse.name}, Your documents have been sent for review, we will be in touch as soon as there is a change in the status of your account</p>`;
                subject = 'Verification submited';

                break;

            // Ajouter des cas pour d'autres events de veriff si nécessaire...
            default:
                console.log('Unrecognized verification status:', code);
        }

        if (!myResponse.success) {
            return res.status(400).json({ error: myResponse.msg });
        }

        res.sendStatus(200);

        // await sendNotificationMail(myResponse.email,subject,htmlMessage);

    } catch (error) {

        console.error(error);
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }

}


module.exports = {

    webhookDecisions,
    webHookEvents
};

