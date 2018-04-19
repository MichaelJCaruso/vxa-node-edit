var socketio = require('socket.io');
var v = require('vxanode').v;
var io;

/******************/
exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on(
        'connection', function (socket) {
            sendMessage(socket,{text:'Ready'});
            handleVisionRequest(socket);
            handlePingPong (socket);
            handleDisconnect(socket);
        }
    );
};

function handleDisconnect(socket) {
    socket.on(
        'disconnect', function() {
        }
    );
}

function handlePingPong(socket) {
    socket.on ('ping-pong', function () {});
    setInterval (function() {socket.emit ('ping-pong');}, 250);
}

function sendMessage(socket,message) {
    socket.emit ('message', message);
}

/******************/
class ClientObject {
    constructor (socket,request) {
	this.socket = socket;
        this.request = request;
    }
    sendResponse (response) {
        sendMessage (this.socket, {text: response, request: this.request});
        return this;
    }
    showGraph (source) {
	this.socket.emit ('showGraph', source);
	return "Sent showGraph:" + source;
    }
}

/******************/
function handleVisionRequest(socket) {
    socket.on(
        'message', function (request) {
            const co = new ClientObject (socket,request.text);
            v(request.text,co).then (
                result=>co.sendResponse (result),
                result=>co.sendResponse ("+++ ERROR: " + result)
            );
        }
    );
}
