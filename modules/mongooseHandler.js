// mongoose setup
const myEnv = require('../config/myEnv');
const mongoClient = require('mongoose');
const mongoConnectionPoolSize = 5;

// query option
/*
 example mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
 - hostN : maybe you use replica db, you should write host name
*/

// mongoose create connection pool
function connect() {
    mongoClient.connect(myEnv.mongodURL, {
        poolSize: mongoConnectionPoolSize
    });
}

// mongoose connection event handler
mongoClient.connection.on('connected', () => {
    console.log('Mongoose default connection open to ' + myEnv.mongodURL);
    console.log((mongoClient.connection.readyState === 1) ? "connect success" : "connect fail");
});

mongoClient.connection.on('error', (err) => {
    console.log('Mongoose default connection error: ', err);
});

mongoClient.connection.on('disconnected', () => {
    console.log('Mongoose default connection discoonnected ');
});

process.on('SIGINT', function() {
    mongoClient.connection.close(function() {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

// add schema
//require('../models/member');


//exports module function
exports.connect = connect;