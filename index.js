/*
* Primary file for an API
* */

//Dependencies

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
const server = http.createServer( (req, res) => {

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

        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler

        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
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



});

// Start the server , and have it listen on port 3000
server.listen(3000,  () => {
    console.log('The server is listening on port 3000');
});

// Define handlers

const handlers = {};

// Sample handler
handlers.sample = function (data, cb) {
    // cb a http status code, and a payload object
    cb(406, {'name': 'sample handler'});

};

// Not found handler
handlers.notFound = function (data, cb) {
    cb(404);
};

// Define a request router
 const router = {
     'sample': handlers.sample
 };