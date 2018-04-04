var socketio = require('socket.io');
var v = require('vxanode').v;
var io;

exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on(
        'connection', function (socket) {
            sendMessage(socket,'Ready');
            handleVisionRequest(socket);
            handlePingPong (socket);
            handleDisconnect(socket);
        }
    );
};

function handlePingPong(socket) {
    socket.on ('ping-pong', function () {});
    setInterval (function() {socket.emit ('ping-pong');}, 250);
}

function handleVisionResult (socket, request, result) {
    sendMessage(socket,result);
}

class ClientObject extends Object {
    constructor (socket) {
	super ();
	this.socket = socket;
    }
    showGraph (source) {
	this.socket.emit ('showGraph', source);
	return "Sent showGraph:" + source;
    }
}

function handleVisionRequest(socket) {
    socket.on(
        'message', function (request) {
            v(request.text,new ClientObject (socket)).then (
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

function sendMessage(socket,messageText) {
    socket.emit ('message', {text: messageText});
}
