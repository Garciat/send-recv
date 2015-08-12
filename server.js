var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var MAX_ROOM_ID = 1000000;
var VIEWS_DIR = __dirname + '/views';

var rooms = {
    
};

app.get('/', function (req, res) {
    var roomId = Math.floor(MAX_ROOM_ID * Math.random());
    
    rooms[roomId] = [{ content: 'Hello [world](#)' }];
    
    res.redirect('/rooms/' + roomId);
});

app.get('/rooms/:id', function (req, res) {
    var roomId = req.params.id;
    var room = rooms[roomId];
    
    if (!room) {
        rooms[roomId] = [{ content: 'Hello [world](#)' }];
    }
    
    res.sendFile(VIEWS_DIR + '/room.html');
});

app.get('/rooms/:id/messages', function (req, res) {
    var roomId = req.params.id;
    var room = rooms[roomId];
    res.send(room);
});

app.post('/rooms/:id/messages', bodyParser.json(), function (req, res) {
    var roomId = req.params.id;
    var room = rooms[roomId];
    room.push(req.body);
    res.send();
    io.to(roomId).emit('update');
});

io.on('connection', function (socket) {
    socket.on('join room', function (roomId) {
        socket.join(roomId);
        console.log('%s joined %s', socket.id, roomId);
    });
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

server.listen(process.env.PORT || 8080, function () {
    var addr = server.address();
    console.log('listening %s:%s', addr.address, addr.port);
});
