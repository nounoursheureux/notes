var express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    engine = require('./engine');

app.use(bodyparser.json());
var routes = require('./routes')(app);
engine.init();
app.listen(3000);
