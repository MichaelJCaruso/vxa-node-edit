var socketio = require('socket.io');
var v = require('vxanode').v;
var io;

exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function (socket) {
      joinRoom(socket, 'Lobby');
      handleVisionRequests(socket);
      handleDisconnect(socket);
  });
};

function joinRoom(socket, room) {
    socket.join(room);
    socket.emit('message', {text: "Ready:" + room});
}

function handleVisionResult (socket, message, result) {
    socket.emit ('message', {text: result});
}

function handleVisionRequests(socket) {
    socket.on(
        'message', function (request) {
            v(request.text).then (
                function (result) {
                    handleVisionResult (socket, request, result);
                },
                function (error) {
                    handleVisionResult (socket, request, "+++ ERROR: " + result);
                }
            );
        }
    );
}

function handleDisconnect(socket) {
    socket.on(
        'disconnect', function() {
        }
    );
}
