/*
*
* Request Handlers
*
* */


// Dependencies
const _data = require('./data');
const helpers = require('./helpers');


// Define handlers
const handlers = {};

// Ping Handler
handlers.ping = function(data, callback){
    callback(200);
};

// Not found handler
handlers.notFound = function (data, cb) {
    cb(404);
};

// Users
handlers.users = function(data, callback){
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    } else {
        callback(405)
    }
};

//Container for users sub-methods
handlers._users = {};

/*
* Users - post
* Required data: firstName, lastName, phone, password, tosAgreement
* Optional data: none
* */
handlers._users.post =function(data, callback){
    let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;
    let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    let tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement ){
        // Make sure the user doesn't already exist
        _data.read('users', phone, function(err, data){
            if(err){
                // Hash the password
                let hashedPassword = helpers.hash(password);

                // Create user object
                if(hashedPassword){
                    let userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, function (err) {
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500,{'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash the user password'});
                }

            } else {
               callback(400, { 'Error': 'A user with that phone number already exist'});
            }
        });
    } else {
        callback(400,{ 'Error': 'Missing required fields'});
    }
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO only let an authenticated user access their object.

handlers._users.get = function(data, callback){
    // Check if the phone numbers is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10
                    ? data.queryStringObject.phone.trim()
                    : false;
    if(phone){
        //Lookup the user
        _data.read('users', phone, function(err, data){
            if(!err && data){
                //  Remove the hash password from the user object before returning to the requester
                delete data.hashedPassword;
                callback(200,data);
            } else {
                callback(404);
            }
        });
    } else {
       callback(400,{ 'Error': 'Missing required field'});
    }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO only let an authenticated user update their own object. Don't let them update anyone else's
handlers._users.put = function(data, callback){
// Check for required field
    let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;

    // Check optional field
    let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    // Error if the phone is valid
    if(phone){
        // Error if nothing is sent to update
        if(firstName || lastName || password){
            // Lookup the user
            _data.read('users', phone, function (err, userData) {
                if(!err && userData){
                    // Update the fields necessary
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the new update
                    _data.update('users', phone, userData, function (err) {
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not update the user'});
                        }
                    })
                } else {
                   callback(400, {'Error': 'The specified user does not exist'});
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'Missing required field'});
    }

};

// Users - delete
// required field: phone
//@TODO Only let an authenticated user delete their object only.
//@TODO cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data, callback){
    // Check if the phone numbers is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10
        ? data.queryStringObject.phone.trim()
        : false;
    if(phone){
        //Lookup the user
        _data.read('users', phone, function(err, data){
            if(!err && data){
              _data.delete('users', phone, function(err){
                  if(!err){
                      callback(200);
                  } else {
                      callback(500, {'Error': 'Could not delete the specified user'});
                  }
              });
            } else {
                callback(400, { 'Error': 'Could not find the specified user'});
            }
        });
    } else {
        callback(400,{ 'Error': 'Missing required field'});
    }
};

// Tokens
handlers.tokens = function(data, callback){
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405)
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// required data: phone , password
// optional data: none
handlers._tokens.post = function(data, callback){
    let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;
    let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    if(phone && password){
        // Lookup the user who matches that phone number
        _data.read('users', phone, function (err, userData) {
            if(!err && userData) {
                // hash the sent password, and compare it to the password stored in the user object
                let hashedPassword = helpers.hash(password);
                if(hashedPassword === userData.hashedPassword){
                    // If valid create a new token with random name. set expiration date 1 hour in the future
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store token
                    _data.create('tokens', tokenId, tokenObject, function(err){
                        if(!err){
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create token'});
                        }

                    });
                } else {
                    callback(400, { 'Error': 'Password did not match'})
                }
            } else {
                callback(400, {'Error': 'Could not find the specified user'});
            }
        })
    } else {
        callback(400,{'Error': 'Missing required field'});
    }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback){
    // Check if the phone numbers is valid
    let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20
        ? data.queryStringObject.id.trim()
        : false;
    if(id){
        //Lookup the tokens
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){

                callback(200,tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{ 'Error': 'Missing required field'});
    }

};

// Tokens - put
//Required data: id, extend
// option data: is none
handlers._tokens.put = function(data, callback){
    let id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20
        ? data.payload.id.trim()
        : false;
    let extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true
        ? true
        : false;
    if(id && extend){
        //Lookup the token
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
                // check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, function (err) {
                        if(!err){
                            callback(200);
                        } else{
                            callback(500, {'Error': 'Could not update the token\' expiration'});
                        }
                    })
                } else{
                    callback(400, {'Error': 'The token has already expired and can not be extended'});
                }
            }else{
                callback(400,{ 'Error': 'Specified token does not exist'});
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields or fields are invalid'});
    }

};

// Tokens - delete
// Required data: id
// Option data: none
handlers._tokens.delete = function(data, callback){
    // Check if the phone numbers is valid
    let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20
        ? data.queryStringObject.id.trim()
        : false;
    if(id){
        //Lookup the token
        _data.read('tokens', id, function(err, data){
            if(!err && data){
                _data.delete('tokens', id, function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified token'});
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find the specified token'});
            }
        });
    } else {
        callback(400,{ 'Error': 'Missing required field'});
    }

};

// verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback){
    //Lookup token
    _data.read('tokens', id, function(err, tokenData){
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            if(tokenData.phone === phone && tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};




// Export the module
module.exports = handlers;