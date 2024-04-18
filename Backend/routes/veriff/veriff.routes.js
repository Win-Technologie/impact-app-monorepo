const { Router } = require("express");
const router = Router();
//MIDDLEWARES
const userAuth = require('../../auth/jwt.authenticated.js')
//CONTROLLERS
const veriffController = require('../../controllers/veriff/veriff.controller.js');
const veriffWebHookController = require('../../controllers/veriff/veriff.webhooks.controller.js')
// VARIABLES
const VERIFF_ROUTER_PATH = process.env.VERIFF_ROUTER_PATH;
// ADMIN FILES AND IMAGES
const multiparty = require('connect-multiparty');
// IMAGES PATH
const md_uploadPdf = multiparty({ uploadDir: `${VERIFF_ROUTER_PATH}` });



// Create a new user verification session on Veriff
router.post('/sessions', [userAuth.ensureAuth, md_uploadPdf], veriffController.NewVeriffSession);
// uploadDocumentToVeriffSession
//router.post('/sessions/media/:sessionId', [userAuth.ensureAuth, md_uploadPdf], veriffController.uploadDocumentToVeriffSession);
// uploadDocument 
router.post('/sessions/media/uploadDocuments/:sessionId', [userAuth.ensureAuth, md_uploadPdf], veriffController.uploadDocuments);
//Check a session decision
// router.get('/decision/:sessionId?"', [userAuth.ensureAuth], veriffController.veriffCheckDecision);

router.get('/decision/:sessionId', [userAuth.ensureAuth, md_uploadPdf], veriffController.checkDecision);

//WEBHOOKS
 router.post('/webhook/decisions', veriffWebHookController.webhookDecisions);


module.exports = router;
