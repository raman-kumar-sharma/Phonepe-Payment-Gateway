const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const MERCHANT_ID = process.env.MERCHANT_ID;
const SALT_KEY = process.env.SALT_KEY;
const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
const PG_PAY_API_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
// const PG_CHECK_STATUS_API_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/{merchantId}/{merchantTransactionId}';

const newPayment = async (req, res) => {
    try {
        // const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: "MT7850590068188104",
            amount: 10 * 100,
            merchantUserId: "MUID123",
            redirectUrl: `http://localhost:5000/api/status/MT7850590068188104`,
            redirectMode: 'Redirect',
            callbackUrl: `http://localhost:5000/api/callback`,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const options = {
            method: 'POST',
            url: PG_PAY_API_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);
        console.log("Payment API Response:", response.data);
        // return res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
        return res.status(200).send(
          response.data.data.instrumentResponse.redirectInfo.url);
    } catch (error) {
      console.error("Error in newPayment:", error);
        res.status(500).send({
            message: error.message,
            success: false
        });
    }
};

const checkStatus = async (req, res) => {
    try {
      console.log("In checkStatus API");
        const merchantTransactionId = "MT7850590068188104"
        const merchantId = "PGTESTPAYUAT";
        const keyIndex = 1;
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const options = {
            method: 'GET',
            url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT/MT7850590068188104`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID':"PGTESTPAYUAT"
            }
        };

        const response = await axios.request(options);
        console.log("Check Status API Response:", response.data);

        if (response.data.success === true) {
            // const url = `http://localhost:5000/success`;
            // return res.redirect(url);

            return   res.json({ success: true });
        } else {
            // const url = `http://localhost:5000/failure`;
            // return res.redirect(url);
            return   res.json({ success: true });
        }
    } catch (error) {
      console.error("Error in checkStatus:", error);
  
      if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Response Status:", error.response.status);
          console.error("Response Headers:", error.response.headers);
          console.error("Response Data:", error.response.data);
      } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received. Request details:", error.request);
      } else {
          // Something happened in setting up the request
          console.error("Error setting up the request:", error.message);
      }
  
      res.status(500).send({
          message: error.message,
          success: false
      });}
};

// Handle server-to-server callback
const handleCallback = (req, res) => {
  try {
    console.log("Inside the Callback API");
    const base64Response = req.body.response; // Get base64-encoded response from the request body
    console.log("Callback API Base64 Response:", base64Response);

    // Validate checksum
    const receivedChecksum = req.headers['x-verify'];
    const calculatedChecksum = calculateChecksum(base64Response, SALT_KEY, 1);

    console.log("Received Checksum:", receivedChecksum);
    console.log("Calculated Checksum:", calculatedChecksum);

    if (receivedChecksum === calculatedChecksum) {
      // Checksum is valid, proceed with handling the callback

      // Decode base64 response
      const decodedResponse = Buffer.from(base64Response, 'base64').toString('utf-8');
      console.log("Decoded Callback API Response:", decodedResponse);

      // Parse the JSON response
      const jsonResponse = JSON.parse(decodedResponse);
      console.log("Parsed Callback API JSON Response:", jsonResponse);

      // Now you can handle the callback response
      if (jsonResponse.success) {
        // Handle success case
        res.status(200).json({ message: 'Payment successful' });
      } else {
        // Handle failure case
        res.status(400).json({ message: 'Payment failed' });
      }
    } else {
      // Checksum is not valid
      console.log("Invalid Checksum");
      res.status(400).json({ message: 'Invalid checksum' });
     
    }
  } catch (error) {
    console.log("Error in handleCallback:", error);
    res.status(500).json({ message: 'Internal server error' });
  
  
}; }





// Function to calculate the checksum
function calculateChecksum(base64Response, saltKey, saltIndex) {
  const hash = crypto.createHash('sha256');
  hash.update(base64Response + saltKey);
  const digest = hash.digest('hex');
  return digest + '###' + saltIndex;
}
module.exports = {
    newPayment,
    checkStatus,
    handleCallback
};