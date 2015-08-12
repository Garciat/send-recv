var express = require('express');

var app = express();

app.get('/', function (req, res) {
    res.send('hola');
});

var server = app.listen(process.env.PORT || 8080, function () {
    var addr = server.address();
    console.log('listening %s:%s', addr.address, addr.port);
});
