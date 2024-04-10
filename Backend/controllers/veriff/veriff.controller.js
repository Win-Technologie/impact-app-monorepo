const jwt = require('../../utils/jwt');

const { getDb } = require('../../mongoConnection');
const { Onfido, Region } = require("@onfido/api");

const path = require('path');
const fs = require('fs/promises');

const axios = require('axios');

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


// GLOBAL CONNECTIONS
const mainDb = getDb(MAINDB);
const userCollection = mainDb.collection(USERSCOLLECTION);

/*
async function NewVeriffSession(req, res) {
    try {

        const userData = req.body;

        if (userData.country === 'Canada' || userData.country === 'CAN' || userData.country === 'CAD') {
            userData.country = 'CA'
        }
    
        var options = { method: 'POST',
        url: '/v1/sessions/',
        headers:
         { 'Content-Type': 'application/json',
           'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY },
        body:
         { verification:
            // { callback: `https://veriff.com`,
            { callback: `${BASE_VERIFF_HTTPS}`,
              person:
               { firstName: userData.name,
                 lastName: userData.lastName,
                 idNumber: userData.idNumber },
            //   document: { number: userData.number, type: userData.docType, country: 'EE' },
            document: { number: userData.number, type: userData.docType, country: userData.country },
              vendorData: '11111111' } },
        json: true };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
          });
        
        res.status(200).json({ msg: 'Hello from New Veriff Session' })

        // return res.status(200).json({ msg: 'Hello from New Veriff Session' })

    } catch (error) {
        return res.status(500).json({ msg: 'Internal server error: ', error })
    }
}
*/

async function NewVeriffSession(req, res) {
    try {
        const userData = req.body;

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
                vendorData: '11111111'
            }
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                // 'X-AUTH-CLIENT': VERIF_API_PUBLIC_KEY
                'X-AUTH-CLIENT': '87668af6-3fcf-451b-aec7-840acba82802'
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

async function uploadDocumentToVeriffSession(req, res) {
    try {

        //sessionId, documentContext, base64Content
       //Recuperer sessionId du parametre
        const sessionId = req.params; 
        //Recuperer documentContext et base64Content du body
        const { documentContext, base64Content } = req.body;
    
      const url = `https://stationapi.veriff.com/v1/sessions/${sessionId}/media`;
      const apiKey = VERIF_API_PUBLIC_KEY; 
      const hmacSignature = 'YOUR_HMAC_SIGNATURE'; // A implementer avec aide Nelson/Angelo 
  
      const requestBody = {
        image: {
          context: documentContext, // 'document-front', 'document-back', 'face'
          content: base64Content // image/document en base64
        }
      };
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-AUTH-CLIENT': apiKey,
          'X-HMAC-SIGNATURE': hmacSignature
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

module.exports = {

    NewVeriffSession,
    uploadDocumentToVeriffSession
};