/*
* Server -related tasks
*
* */
//Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config.js');
const fs = require('fs');
const  _data = require('./data');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

// Instantiate the server module object
const server = {};


//@TODO Get rid of this
helpers.sendTwilioSms('+447462662831', 'Hello Aima', function (err) {
    console.log('This was the error',err);
});


// Testing
// @TODO  delete this
// Create a file
_data.create('test', 'newFile', {'foo': 'bar'}, function (error) {
    console.log('This was the error', error);
});

// Read file
_data.read('test', 'newFile', function (error, data) {
    console.log('This was the error', error, 'and this was the data', data);
});

//Updating file
_data.update('test', 'newFile', {'fizz':'buzz'}, function (error) {
    console.log('This was the error', error);
});
// Delete file
_data.delete('test', 'newFile', function (error) {
    console.log('This was the error', error);
});


// Instantiate the http server
server.httpServer = http.createServer( (req, res) => {
    server.unifiedServer(req, res);

});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer( server.httpsServerOptions, function(req, res) {
    server.unifiedServer(req, res);

});

// All the server logic for both the http and https server
server.unifiedServer = function(req, res){

    // Get the URL and parse it
    const parseUrl= url.parse(req.url, true);

    // Get the path
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    //Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data',(data) =>{
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose handler request path.

        const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler

        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        //Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Define the status code called back by the handler, or by default to 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            //Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            //Return the res
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);


            //Log the request path
            console.log(`Request received on this path 
            ${trimmedPath} with method: 
            ${method} request received with these headers:
            ${headers}
        `);

            console.log(`Returning this response: ${statusCode} and ${payloadString}`);

        });

    });
    // Get  the query string as an object
    const queryStringObject = parseUrl.query;

};



// Define a request router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};

// Init script
server.init = function(){
    // Start the  HTTP server
    server.httpServer.listen(config.httpPort,  () => {
        console.log('The server is listening on port '+ config.httpPort + " in " + config.envName + " mode");
    });

    //Start the HTTPS server
    server.httpsServer.listen(config.httpsPort,  function() {
        console.log('The server is listening on port '+ config.httpsPort + " in " + config.envName + " mode");
    });



};

// Export the module
module.exports = server;