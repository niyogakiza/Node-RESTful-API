/*
* Helpers for various tasks
*
* */

// Dependencies
const  config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');



//Container for all the helpers
const helpers = {};

// Parse a Json string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
    try{
        let obj = JSON.parse(str);
        return obj;
    }catch (e) {
        return{};
    }
};


// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof (str) === 'string' && str.length > 0){
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Create a string of random alphanumeric character, of a given length
helpers.createRandomString= function(strLength){
    strLength = typeof (strLength) === 'number' && strLength > 0 ? strLength : false;
    if(strLength){
        // Define all the possible characters that could go into a string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        // Start the final string
        let str = '';
        for(let i = 1; i <= strLength; i++){
            // get a random character from the possible characters string and append it to the final string
            let randomCharacter =possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
                str += randomCharacter;
        }

        return str;

    } else {
        return false;
    }
};

// send an sms message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback){
    // Validate the parameters
    phone = typeof (phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false;
    msg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg){
        // Config the request payload
        let payload = {
            'From': config.twilio.fromPhone,
            'To': '+44'+phone,
            'Body': msg
        };

        // Stringify the payload
        let stringPayload = querystring.stringify(payload);

        // Config the request details
        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Message.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'content-Length': Buffer.byteLength(stringPayload)
            }
        };
        // Instantiate the  request object
        let req = https.request(requestDetails, function (res) {
            // Grab the status of the sent request
            let status = res.statusCode;
            // Callback successfully if the request went through
            if(status === 200 || status === 201) {
                callback(false);

            } else {
                callback('Status code returned was '+status);
            }
        });
        // Bind to error event so that  doesn't get thrown
        req.on('error', function (e) {
            callback(e);
        });
        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }


};

// Export the module
module.exports = helpers;
