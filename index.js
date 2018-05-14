/*
* Primary file for an API
* */
//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// Declare the app
const app = {};

// init function
app.init = function(){
    // Start the server
    server.init();

    // Start the workers
    workers.init();
};

// Execute
app.init();


// Export the app
module.exports = app;