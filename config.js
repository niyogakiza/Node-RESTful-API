/*
* Create and export configuration variables
*
* */
//Container for all the environments
const environments = {};


//Staging object
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
};

//Production Environments
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
};


// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check that the current environment is one of the environment above, if not, default staging
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module
module.exports = environmentToExport;


/*
* Command key to generate https key and certificate, type that in terminal https directory of course
* openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
*/