var bodyparser = require('body-parser'),
    path = require('path');


var notes = {};

notes.initDatabase = function(database,authFile)
{
    var authPromise = require('./auth').init(authFile);
    var enginePromise = require('./engine').init(database);
    return Promise.all([authPromise,enginePromise]);
};

notes.configureServer = function(app,database,authFile,baseDir)
{
    return new Promise(function(resolve,reject){
        app.use(bodyparser.json());
        notes.initDatabase(database,authFile).then(function(values){
            if(baseDir)
            {
                path.normalize(baseDir);
                if(baseDir.slice(-1) != '/') baseDir += '/';
            }
            var routes = require('./routes')(app,values[0],values[1],baseDir);
            resolve({auth:values[0],engine:values[1]});
        },function(error){
            reject(error);
        });
    });
};

module.exports = notes;
