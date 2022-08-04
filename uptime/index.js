/*
* Primary file for the API
*
*/


var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');

//Test writing data
//@TODO delete this

_data.create('test', 'newFile', {'foo':'bar'}, function(err){
    console.log('this was the error', err);
});




// Instantiating the http server
var httpServer = http.createServer(function(req,res) {
   unifiedServer(req,res);
});

// Instantiating the https server

var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};



var httpsServer = https.createServer(httpsServerOptions, function(req,res) {
    unifiedServer(req,res);
 });

//start the https server

var unifiedServer = function(req,res) { 
        //Get the URL and parse it
        var parsedUrl = url.parse(req.url,true);

        //Get the path from the URL
        var path = parsedUrl.pathname;
        var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
        //get the query string as an object
        var queryStringObject = parsedUrl.query;
    
        //get the headers as an object
        var headers = req.headers;
    
        //Get the HTTP method
        var method = req.method.toLowerCase();
    
        //Get the payload if there is any
        var decoder = new StringDecoder('utf-8');
        var buffer = '';
        req.on('data', function(data) {
            buffer += decoder.write(data);
    
        });
    
      
    
        req.on('end', function() {
        buffer += decoder.end();
    
        // Choose the handler this request should go to
        // If one is not found, use the Not Found handler
    
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    
        var data =  { 
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };
    
        //route the request to the specified handler
    
        chosenHandler(data, function(statusCode, payload) {
            // default status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};
    
            // Convert the payload to string
    
            var payloadString = JSON.stringify(payload);
    
            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returing this response ', statusCode, payloadString);            
            
            });
    
    
       
        //log the request
        console.log("Request received with this payload: ", buffer);
        });
}



//Start the http server on configured port
httpServer.listen(config.httpPort, function(){
    console.log(config.envName.toUpperCase() + "\t: HTTP listening on port " + config.httpPort);
});

//Start the http server on configured port
httpsServer.listen(config.httpsPort, function(){
    console.log(config.envName.toUpperCase() + "\t: HTTPS Listening on port " + config.httpsPort);
});

// Define a request router

var handlers = {};

//define the route handlers

// handler for ping
handlers.ping = function(data, callback) {
    callback(200);
};

//Not found handler
handlers.notFound = function(data, callback)
{
    callback(404);
};

var router = {
    'ping' : handlers.ping
};

