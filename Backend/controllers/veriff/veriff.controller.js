const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');
const got = require('got');
const crypto = require('crypto');

const { getSessionDecision, isSignatureValid } = require('../../utils/veriff');


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
        // console.log(response.body);

        // const myResponse = response;
        const headers = response.headers;
        const body = response.body;

        console.log('*********HEADERS********')
        console.log(headers)
        console.log('*****************')
        // console.log('*****************')
        // console.log('*********BODY********')
        // console.log(body)

        res.status(200).json({
            msg: 'Hello from New Veriff Session',
            id: body.verification.id,
            status: body.verification.status,
            url: body.verification.url,
            sessionToken: body.verification.sessionToken
         
        });

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

        const apiKey = VERIF_API_PUBLIC_KEY;
        const hmacSignature = 'Impact_Tecnhologie'; // A implementer avec aide Nelson/Angelo 

        const requestBody = {
            image: {
                context: documentContext, // 'document-front', 'document-back', 'face'
                content: base64Content // image/document en base64
            }
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY,
                'X-HMAC-SIGNATURE': 'Impact_Tecnhologie'
            }
        };

        const response = await axios.post(url, requestBody, config);
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading document to Veriff:', error.message);
        throw error; // Ou gérer l'erreur d'une autre manière
    }
}

async function uploadDocuments(req, res) {
    const { sessionId } = req.params;

    const reqFiles = req.files;

    console.log(sessionId);
    const photoFront = reqFiles.photoFront
    const photoBack = reqFiles.photoBack;
    const photoFace = reqFiles.photoFace;

    // Validation basique pour s'assurer que toutes les photos sont fournies
    if (!photoFront || !photoBack || !photoFace) {
        return res.status(400).json({ error: 'Missing required photos' });
    }

    try {
        // Téléchargement de chaque document/photo
        //  const responses = await Promise.all([
        //     uploadDocumentToVeriffSessionSplit(sessionId, 'document-front', photoFront),
        //     uploadDocumentToVeriffSessionSplit(sessionId, 'document-back', photoBack),
        //     uploadDocumentToVeriffSessionSplit(sessionId, 'face', photoFace),
        // ]);

        // const responses = await uploadDocumentToVeriffSessionSplit(sessionId, 'document-front', photoFront);

        // Vous pouvez choisir de loguer les réponses ou de les envoyer de retour au client
        console.log('Upload responses:', responses);
        res.status(200).json({ message: 'Documents uploaded successfully' });
    } catch (error) {
        // En cas d'erreur avec l'une des uploads, renvoyer une erreur
        console.error('Error during document upload:', error);
        res.status(500).json({ error: 'Failed to upload documents' });
    }
}

async function uploadDocumentToVeriffSessionSplit(sessionId, documentContext, base64Content) {
    try {
      const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}/media`;
      const apiKey = VERIF_API_PUBLIC_KEY; // Remplacez par votre clé API publique
      const hmacSignature = 'b2a0bd97-e5f7-4360-b17c-07479b92472e'; // Remplacez par votre signature HMAC
    
    
    console.log(url);
    const photoPath = base64Content.path;
    //photoPath to base64
    const base64 = await fs.readFile(photoPath, { encoding: 'base64' });


     console.log("DOCUMENT CONTEXT: ", documentContext, "FIN CONTEXT") ;
        console.log("BASE64 CONTENT: ", base64, "FIN CONTENT") ;
      const requestBody = {
        image: {
          context: documentContext, // 'document-front', 'document-back', 'face'
          content: base64 // Votre image/document en base64
        }
      };
      


      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-AUTH-CLIENT': apiKey,
          'X-HMAC-SIGNATURE': hmacSignature
        }
      };
      
      // Envoi de la requête POST à l'API Veriff utilisant got au lieu de axios
        const response = await got.post(url, {
            ...config,
            json: requestBody
        });

      console.log('Response:', response.data);
      return response.data;

    } catch (error) {
        console.error('Error uploading document to Veriff:', error.message);
        throw error; // Ou gérer l'erreur d'une autre manière
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

async function checkDecision(req, res) {

    try {
        const { sessionId } = req.params;  
        const { headers, body } = await getSessionDecision(sessionId); // Obtener la decisión de sesión

        // console.log(headers);
        if ('x-hmac-signature' in headers) {
            const signature = headers['x-hmac-signature'];
            console.log('Valor de X-HMAC-SIGNATURE:', signature);

            // Vérifier la validité de la signature sur la réponse
            const isVeriffSignatureValid = isSignatureValid({
                signature: signature, // Obtenir la signature des en-têtes de réponse de Veriff
                shared_secret_key: X_HMAC_SIGNATURE, // Clé secrète partagée
                payload: body // Utiliser le corps de la réponse comme payload pour la vérification
            });

             // Vérifier si la signature est valide
            if (isVeriffSignatureValid) {
                console.log('La signature sur la réponse de Veriff est valide.');
               return res.status(200).json(body); 

            } else {
                console.log("La signature dans la réponse de Veriff n'est pas valide.");
                return res.status(403).json({msg:"Signature non autorisée"}); 
            }

        } else {
            console.log("X-HMAC-SIGNATURE introuvable dans les en-têtes.");
            return res.status(403).json({msg:"Signature non trouvée"}); 
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ msg: 'Internal server error: ', error });
    }
}


// api call using deleteSession
async function deleteVeriffSession(req, res) {
    try {
        const { sessionId } = req.params;
        const apiKey = VERIF_API_PUBLIC_KEY;
        const hmacSignature = 'Impact_Tecnhologie'; // A implementer avec aide Nelson/Angelo

        const response = await deleteSession(sessionId, apiKey, hmacSignature);
        console.log('Response:', response);
        return response;
    } catch (error) {
        console.error('Error deleting session:', error.message);
        throw error;
    }
}

// async function getSessionDecision(sessionId) {
//     try {

//         const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}/decision`;
//         // Construir el payload como el sessionId
//         const payload = sessionId;
//         // Construir el mensaje que se firmará
//         const message = payload;

//         //// Generar la firma HMAC usando la clave compartida
//         // const hmac = crypto.createHmac('sha256', X_HMAC_SIGNATURE);
//         // hmac.update(message);
//         // const signature = hmac.digest('hex');
//         const signature = generateHMACSignature(payload, X_HMAC_SIGNATURE);

//         // Configurar los encabezados de la solicitud
//         const headers = {
//             'Content-Type': 'application/json',
//             'X-HMAC-SIGNATURE': signature,
//             'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY
//         };

//         // Configurar las opciones de la solicitud
//         const options = {
//             headers: headers,
//             responseType: 'json'
//         };

//         try {
//             // Realizar la solicitud a la API de Veriff
//             const response = await got(url, options);

//             // Retornar el cuerpo de la respuesta
//             return response.body;

//         } catch (error) {
//             console.error('Error:', error.response.body);
//             throw new Error(error);
//         }

//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
// }


// function generateHMACSignature(message, sharedSecretKey) {
//     const hmac = crypto.createHmac('sha256', sharedSecretKey);
//     hmac.update(message);
//     return hmac.digest('hex');
// }





//DELETE /sessions/{sessionId}
async function deleteSession(sessionId, apiKey, hmacSignature) {
    try {
        const url = `/v1/sessions/${sessionId}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': hmacSignature,
                'X-AUTH-CLIENT': apiKey
            }
        };

        const response = await axios.delete(url, config);
        return response.data;
    } catch (error) {
        console.error('Error deleting session:', error.message);
        throw error;
    }
}

//GET /sessions/{sessionId}/person
async function getPersonInfo(sessionId, apiKey, hmacSignature) {
    try {
        const url = `/v1/sessions/${sessionId}/person`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': hmacSignature,
                'X-AUTH-CLIENT': apiKey
            }
        };

        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching person information:', error.message);
        throw error;
    }
}

//POST /sessions/{sessionId}/collected data
async function uploadCollectedData(sessionId, apiKey, hmacSignature, requestData) {
    try {
        const url = `/v1/sessions/${sessionId}/collected-data`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': hmacSignature,
                'X-AUTH-CLIENT': apiKey
            }
        };

        const response = await axios.post(url, requestData, config);
        return response.data;
    } catch (error) {
        console.error('Error uploading collected data:', error.message);
        throw error;
    }
}

//GET /media/{mediaId}
async function getMedia(mediaId, apiKey, hmacSignature) {
    try {
        const url = `/v1/media/${mediaId}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': hmacSignature,
                'X-AUTH-CLIENT': apiKey
            }
        };

        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        console.error('Error retrieving media:', error.message);
        throw error;
    }
}


//GET /sessions/{sessionId}/watchlist-screening
async function getWatchlistScreening(sessionId, apiKey, hmacSignature) {
    try {
        const url = `/v1/sessions/${sessionId}/watchlist-screening`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': hmacSignature,
                'X-AUTH-CLIENT': apiKey
            }
        };

        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        console.error('Error retrieving watchlist screening data:', error.message);
        throw error;
    }
}


module.exports = {

    NewVeriffSession,
    uploadDocumentToVeriffSession,
    uploadDocuments,
    checkDecision
};

