/*
* Library for storing and editing data
*
* 
*/

//Dependencies

var fs = require('fs');
var path = require('path');

// Container for the module (to be exported)

var lib = {};

// Base data directory (.data)
lib.baseDir = path.join(__dirname,'/../.data/');

// Write data to a file
// For our model, sub directories of .data will be like tables, e.g., .data/users

lib.create = function(dir,file,data,callback) {

    // Open the file for writing with 'wx' flag for writing

    fs.open(lib.baseDir + dir + '/' + file + '.json','wx', function(err, fileDescriptor) {
        if(!err && fileDescriptor)
        {
            //Convert data to string
            var stringData = JSON.stringify(data);

            //Write data to file and close it

            fs.writeFile(fileDescriptor, stringData, function(err) {
                if(!err){
                    fs.close(fileDescriptor, function(err) {
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }


                    });
                } else {
                    callback('Error writing to new file');
                }

            })
        } else {
            callback('Could not create new file, it may already exist');
        }
    });

};



// Export the module
module.exports = lib;



