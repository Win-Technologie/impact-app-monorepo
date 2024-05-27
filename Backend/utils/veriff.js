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

async function deleteSession01(sessionId) {
    try {
        
        const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}`;
        //const url = `https://api.veriff.me/v1/sessions/${sessionId}`;

        const payload = sessionId;

      

        const timeStamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        const baseURL = 'https://api.veriff.me/v1/sessions';

        const payloadImageFront = JSON.stringify({
            image: {
                context: 'document-front', // Contexte pour l'image de la face du document
                content: frontBase64, // Contenu de l'image en Base64
                timestamp: timeStamp, // Horodatage actuel
                inflowFeedback: true // Retour de flux
            }
        });


        const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

        // Debug 
        console.log("SESSION ID : ");
        console.log(sessionId);

        const headers = {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY
        };

        const options = {
            headers: headers,
            method: 'DELETE',
            responseType: 'json'
        };
        try {
            const response = await got(url, options);
            console.log(" REPONSE : ", response);
            return ({ headers: response.headers, body: response.body });
        }
        catch (error) {
            console.error('ERREUR INTERNE A LA FONCTION DELETE SESSION :', error);
            throw new Error(error);
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function deleteSession(sessionId) {
    try {

        const apiKey = VERIF_API_PUBLIC_KEY;
        const privateApiKey = X_HMAC_SIGNATURE;

        const baseURL = 'https://api.veriff.me/v1/sessions';
        const url = `${baseURL}/${sessionId}`;

        // Payload para la solicitud DELETE
        const payload = JSON.stringify({});

        // Generar la firma HMAC
        const signature = generateHMACSignature(sessionId, privateApiKey);

        // Configurar los encabezados
        const headers = {
            'X-AUTH-CLIENT': apiKey,
            'X-HMAC-SIGNATURE': signature,
            'Content-Type': 'application/json'
        };

        // Realizar la solicitud DELETE
        const response = await axios.delete(url, { headers });

        return response.data;

    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}



async function getPersonInfo(sessionId, apiKey) {
    try {
        const url = `${VERIFF_BASE_URL}/v1/sessions/${sessionId}/person`;

        const payload = sessionId;
        const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

        const headers = {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': apiKey
        };

        const options = {
            headers: headers
        };

        try {
            const response = await got(url, options);

            return response.data;
        }
        catch (error) {
            console.error('Error getting person info:', error);
            throw new Error(error);
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function uploadCollectedData(sessionId, apiKey, requestData) {
    try {
        const url = `${VERIFF_BASE_URL}/v1/sessions/${sessionId}/collected-data`;

        const payload = JSON.stringify(requestData);
        const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

        const headers = {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': apiKey
        };

        const options = {
            headers: headers
        };

        try {
            const response = await got.post(url, options);

            return response.data;
        }
        catch (error) {
            console.error('Error uploading collected data:', error);
            throw new Error(error);
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getMedia(mediaId, apiKey) {

    try {
        const url = `${VERIFF_BASE_URL}/v1/media/${mediaId}`;

        const payload = mediaId;
        const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

        const headers = {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': apiKey
        };

        const options = {
            headers: headers
        };

        try {
            const response = await got(url, options);

            return response.data;
        }
        catch (error) {
            console.error('Error getting media:', error);
            throw new Error(error);
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getWatchlistScreening(sessionId, apiKey) {
    try {
        const url = `${VERIFF_BASE_URL}/v1/sessions/${sessionId}/watchlist-screening`;

        const payload = sessionId;
        const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

        const headers = {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': apiKey
        };

        const options = {
            headers: headers
        };

        try {
            const response = await got(url, options);

            return response.data;
        }
        catch (error) {
            console.error('Error getting watchlist screening:', error);
            throw new Error(error);
        }
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// OK
async function getSessionDecision(sessionId) {
    try {

        const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}/decision`;
        // Construire le payload en tant que sessionId
        const payload = sessionId;
        // // Construire le message à signer
        //  const message = payload;
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

// OK
function generateHMACSignature(message, sharedSecretKey) {
    const hmac = crypto.createHmac('sha256', sharedSecretKey);
    hmac.update(message);
    return hmac.digest('hex');
}

// OK
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


// modify user veriff attributes
// async function modifAndGetUserVeriffAttributes(verificationId, status, verifStatus, verifAproved) {

//     try {
//         let myUser = await userCollection.findOne({ sessionId: verificationId });

//         if (!myUser) {
//             return { success: false, msg: "User session id does not exist" };
//         }

//         const updateResult = await userCollection.updateOne(
//             { sessionId: verificationId },
//             {
//                 $set: {
//                     verifStatus: verifStatus,
//                     verifAproved: verifAproved,
//                     verifCheckDecision: status
//                 }
//             }
//         );

//         if (updateResult.modifiedCount > 0) {
//             return { success: true, msg: "Success", email: myUser.email, name: myUser.name };
//         } else {
//             return { success: false, msg: "Modif User Veriff Attributes: Failed to update user" };
//         }


//     } catch (error) {
//         throw new Error(error);
//     }
// }

async function modifAndGetUserVeriffAttributes(verificationId, status, verifStatus, verifAproved) {
    try {
        let myUser = await userCollection.findOne({ sessionId: verificationId });

        if (!myUser) {
            return { success: false, msg: "User session id does not exist" };
        }

        let response = {
            success: true,
            msg: "Success",
            email: myUser.email,
            name: myUser.name
        };

        // Vérifier si le statut est égal à "resubmission_required".
        if (status === 'resubmission_required') {
            // Si oui, ajouter le champ url
            response.url = myUser.verifLink;
        }

        const updateResult = await userCollection.updateOne(
            { sessionId: verificationId },
            {
                $set: {
                    verifStatus: verifStatus,
                    verifAproved: verifAproved,
                    verifCheckDecision: status
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            // Si aucun document n'a été mis à jour, ajuster la réponse
            response.success = false;
            response.msg = "Modif User Veriff Attributes: Failed to update user: Failed to update user";
        }

        return response;

    } catch (error) {
        throw new Error(error);
    }
}

// OK
async function instanceVeriffSession(userData) {
    try {
        // const userData = req.body;

        if (!userData) {
            return res.status(403).json({ msg: "Bad request" });
        }

        if (userData.country === 'Canada' || userData.country === 'CAN' || userData.country === 'CAD' || userData.country === 'canada' || userData.country === 'CANADA' || userData.country === 'Canadá') {
            userData.country = 'CA';
        }

        const requestBody = {
            verification: {
                callback: `${BASE_VERIFF_HTTPS}`,
                person: {
                    firstName: userData.name,
                    lastName: userData.lastName,
                    idNumber: userData.idNumber
                },
                document: {
                    number: userData.number,
                    type: userData.docType,
                    country: userData.country
                },
                vendorData: 'Impact_Tecnhologie'
            }
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY
            },
            responseType: 'json'
        };

        const response = await got.post(VERIFF_FULL_API_PATH, {
            ...config,
            json: requestBody
        });
        // console.log(response.body);

        // const myResponse = response;
        const headers = response.headers;
        const body = response.body;

        // console.log('*********HEADERS********')
        // console.log(headers)
        // console.log('*****************')
        // // console.log('*****************')
        // // console.log('*********BODY********')
        // // console.log(body)

        let veriffResp = false;

        if (body.status == 'success') {
            veriffResp = true
            return { veriffResp, body }
        }

        console.log("FROM VERIFF CONTROLLER");
        console.log(veriffResp);
        console.log(body);

        return { veriffResp, body }
        // res.status(200).json({
        //     msg: 'Hello from New Veriff Session',
        //     id: body.verification.id,
        //     status: body.verification.status,
        //     url: body.verification.url,
        //     sessionToken: body.verification.sessionToken

        // });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Internal server error: ', error });
    }
}

// OK
async function uploadAllImagesToVeriff(sessionId, frontBase64, backBase64, selfieBase64, user) {
    try {

        // Clés de l'API nécessaires pour l'authentification
        const apiKey = VERIF_API_PUBLIC_KEY;
        const privateApiKey = X_HMAC_SIGNATURE;
// Obtenir la date et l'heure actuelles au format ISO, en supprimant les millisecondes
        const timeStamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        const baseURL = 'https://api.veriff.me/v1/sessions';

        // Construire l'URL de la session spécifique
        const urlMedia = `${baseURL}/${sessionId}`;

        // Créer les payloads (charges utiles) pour chaque image en format JSON
        const payloadImageFront = JSON.stringify({
            image: {
                context: 'document-front', // Contexte pour l'image de la face du document
                content: frontBase64, // Contenu de l'image en Base64
                timestamp: timeStamp, // Horodatage actuel
                inflowFeedback: true // Retour de flux
            }
        });

        const payloadImageBack = JSON.stringify({
            image: {
                context: 'document-back',  // Contexte pour l'image du verso du document
                content: backBase64, // Contenu de l'image en Base64
                timestamp: timeStamp, // Horodatage actuel
                inflowFeedback: true// Retour de flux
            }
        });

        const payloadImageFace = JSON.stringify({
            image: {
                context: 'face', // Contexte pour l'image du visage
                content: selfieBase64, // Contenu de l'image en Base64
                timestamp: timeStamp, // Horodatage actuel
                inflowFeedback: true // Retour de flux
            }
        });

          // Payload pour indiquer que la vérification est terminée
        const payloadUploadCompleted = JSON.stringify({
            verification: {
                status: 'submitted', // Statut de la vérification
                timestamp: timeStamp // Horodatage actuel
            }
        });

        // Générer les signatures HMAC pour chaque payload
        const signatureFront = generateHMACSignature(payloadImageFront, privateApiKey);
        const signatureBack = generateHMACSignature(payloadImageBack, privateApiKey);
        const signatureFace = generateHMACSignature(payloadImageFace, privateApiKey);
        const signatureCompleted = generateHMACSignature(payloadUploadCompleted, privateApiKey);

        // Fonction pour configurer les en-têtes des requêtes
        const headers = (signature) => ({
            'X-AUTH-CLIENT': apiKey, // Clé publique de l'API
            'X-HMAC-SIGNATURE': signature, // Signature HMAC générée
            'Content-Type': 'application/json' // Type de contenu
        });

        // Envoyer les requêtes pour télécharger chaque image
       const resRecto = await axios.post(`${urlMedia}/media`, payloadImageFront, { headers: headers(signatureFront) });
    //    console.log("************************");
    //    console.log("resRecto");
    //    console.log(resRecto);

       const resVerso =  await axios.post(`${urlMedia}/media`, payloadImageBack, { headers: headers(signatureBack) });
    //    console.log("************************");
    //    console.log("resRecto");
    //    console.log(resVerso);

       const resSelfie =  await axios.post(`${urlMedia}/media`, payloadImageFace, { headers: headers(signatureFace) });
       console.log("************************");
       console.log("resSelfie");
       console.log(resSelfie);
       console.log("************************");

        // Envoyer une requête pour compléter le téléchargement des images
        const response = await axios.patch(urlMedia, payloadUploadCompleted, { headers: headers(signatureCompleted) });

        // Retourner les données de la réponse
        return response.data;

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    getSessionDecision,
    generateHMACSignature,
    isSignatureValid,
    instanceVeriffSession,
    // modifUserVeriffAttributes,
    modifAndGetUserVeriffAttributes,
    deleteSession,
    getPersonInfo,
    uploadCollectedData,
    getMedia,
    uploadAllImagesToVeriff
}