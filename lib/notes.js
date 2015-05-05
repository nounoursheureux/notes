var express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    path = require('path');

app.use(bodyparser.json());

var notes = {};

notes.initDatabase = function(database,authFile)
{
    var authPromise = require('./auth').init(authFile);
    var enginePromise = require('./engine').init(database);
    return Promise.all([authPromise,enginePromise]);
};

notes.startServer = function(port,database,authFile,baseDir)
{
    return new Promise(function(resolve,reject){
        notes.initDatabase(database,authFile).then(function(values){
            if(baseDir)
            {
                path.normalize(baseDir);
                if(baseDir.slice(-1) != '/') baseDir += '/';
            }
            var routes = require('./routes')(app,values[0],values[1],baseDir);
            console.log('Starting server on port ' + port);
            app.listen(port);
            resolve(values);
        },function(error){
            reject(error);
        });
    });
};

module.exports = notes;
