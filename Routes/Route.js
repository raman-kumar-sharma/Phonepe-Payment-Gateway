
const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/Payment');

// the route for Pay API
router.post('/pay', paymentController.newPayment);

// the route for Check Status API
router.post('/status/:transactionId', paymentController.checkStatus);

// the route for Server-to-Server Callback
router.post('/callback', paymentController.handleCallback);


module.exports = router;