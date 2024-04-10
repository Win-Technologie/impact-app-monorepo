const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

const got = require('got');


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

// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);

/*
async function NewVeriffSession(req, res) {
    try {
        const userData = req.body;

        // Récupérer le jeton du header de la requête
        const token = req.headers.authorization?.replace("Bearer ", "");
        // Vérifier si le jeton est présent
        if (!token) {
            console.error('Le Token n\'est pas fourni');
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Décoder le token pour obtenir les informations de l'utilisateur
        const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        if (!myToken) {
            return res.status(400).json({ msg: "Token invalide" });
        }

        if (userData.country === 'Canada' || userData.country === 'CAN' || userData.country === 'CAD') {
            userData.country = 'CA';
        }

        const userExist = await userCollection.findOne({ _id: myToken.user_id });

        if (!userExist) {
            return res.status(400).json({ msg: "l'utilisateur n'existe pas" });
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
                // 'X-AUTH-CLIENT': '87668af6-3fcf-451b-aec7-840acba82802'
            }
        };

        const response = await axios.post('https://stationapi.veriff.com/v1/sessions/', requestBody, config);
        console.log(response.data);
        
        res.status(200).json({ msg: 'Hello from New Veriff Session' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Internal server error: ', error });
    }
}
*/

async function NewVeriffSession(req, res) {
    try {
        const userData = req.body;

        if (!userData) {
            return res.status(403).json({ msg: "Bad request" });
        }

        // Récupérer le jeton du header de la requête
        // const token = req.headers.authorization?.replace("Bearer ", "");
        // // Vérifier si le jeton est présent
        // if (!token) {
        //     console.error('Le Token n\'est pas fourni');
        //     return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        // }
        // // Décoder le token pour obtenir les informations de l'utilisateur
        // const myToken = jwt.decoded(token); // Assurez-vous que cette fonction peut décoder le token JWT
        // if (!myToken) {
        //     return res.status(400).json({ msg: "Token invalide" });
        // }

        if (userData.country === 'Canada' || userData.country === 'CAN' || userData.country === 'CAD') {
            userData.country = 'CA';
        }

        // const userExist = await userCollection.findOne({ _id: myToken.user_id });

        // if (!userExist) {
        //     return res.status(400).json({ msg: "l'utilisateur n'existe pas" });
        // }

        if (userData.country === 'Canada' || userData.country === 'CAN' || userData.country === 'CAD') {
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
        console.log(response.body);

        res.status(200).json({ msg: 'Hello from New Veriff Session' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Internal server error: ', error });
    }
}

async function uploadDocumentToVeriffSession(req, res) {
    try {

        //sessionId, documentContext, base64Content
        //Recuperer sessionId du parametre
        const sessionId = req.params;
        //Recuperer documentContext et base64Content du body
        const { documentContext, base64Content } = req.body;

        //const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}/media`;
        const url = `${VERIFF_FULL_API_PATH}${sessionId}/media`;

        console.log(url);

        //   const apiKey = VERIF_API_PUBLIC_KEY; 
        //  const hmacSignature = 'Impact_Tecnhologie'; // A implementer avec aide Nelson/Angelo 

        // const requestBody = {
        //     image: {
        //         context: documentContext, // 'document-front', 'document-back', 'face'
        //         content: base64Content // image/document en base64
        //     }
        // };

        // const config = {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY,
        //         'X-HMAC-SIGNATURE': 'Impact_Tecnhologie'
        //     }
        // };

        // const response = await axios.post(url, requestBody, config);
        // console.log('Response:', response.data);
        // return response.data;
    } catch (error) {
        console.error('Error uploading document to Veriff:', error.message);
        throw error; // Ou gérer l'erreur d'une autre manière
    }
}

module.exports = {

    NewVeriffSession,
    uploadDocumentToVeriffSession
};