var express = require('express'),
    app = express(),
    bodyparser = require('body-parser');

app.use(bodyparser.json());
if(process.argv.length < 3) console.log('Usage: node index.js <port number>');
else
{
    var routes = require('./routes')(app,'data/db.sql');
    app.listen(process.argv[2]);
}
