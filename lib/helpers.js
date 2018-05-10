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


// Export the module
module.exports = helpers;
