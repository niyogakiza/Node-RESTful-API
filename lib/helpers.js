/*
* Helpers for various tasks
*
* */

// Dependencies
const  config = require('./config');
const crypto = require('crypto');



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

// Export the module
module.exports = helpers;
