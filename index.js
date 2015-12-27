var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    Firebase = require('firebase');

var fb = new Firebase('https://socketio.firebaseio.com/');
var users = [];

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

io.on('connection', function (socket, user) {
    fb.orderByChild('date').once('value', function (snapshot) {
        snapshot.forEach(function (data) {
            io.emit('chat message', data.val().message, data.val().user);
        });
    });
    socket.on('connection', function (user) {
        users.push(user);
        console.log('connected user ' + user);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on('chat message', function (user, msg) {
        if (msg)
            io.emit('chat message', msg, user);
        if (msg)
            fb.push({
                date: Firebase.ServerValue.TIMESTAMP,
                user: user,
                message: msg
            });
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});