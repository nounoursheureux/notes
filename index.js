var express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    config = require('./config.json'),
    sqlite3 = require('sqlite3'),
    db = new sqlite3.Database(config.database);

app.use(bodyparser.json());
if(process.argv.length < 3) console.log('Usage: node index.js <port number>');
else
{
    db.serialize(function(){
        db.run("CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY,title VARCHAR(40),content VARCHAR(500),owner VARCHAR(20),private INTEGER)");
        db.run("CREATE TABLE IF NOT EXISTS users(username VARCHAR(20) UNIQUE,password CHAR(128),email VARCHAR(50))");
    });
    var routes = require('./routes')(app,config.database);
    app.listen(process.argv[2]);
}
