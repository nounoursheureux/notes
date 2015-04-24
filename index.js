var express = require('express'),
    app = express(),
    routes = require('./routes')(app);

app.listen(3000);
