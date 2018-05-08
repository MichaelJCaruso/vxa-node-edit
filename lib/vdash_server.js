// const { Library } = require('remote-lib');
// const websocket = require('websocket-stream');

const socketio = require('socket.io');
const v = require('vxanode').v;

/******************/
class VisionClientObject {
    constructor (connection,request) {
	this.connection = connection;
        this.request = request;
    }
    sendResponse (response) {
        this.connection.sendMessage({text: response, request: this.request});
        return this;
    }
    showGraph (...args) {
	this.connection.send('showGraph', ...args);
	return "Sent showGraph:" + args.toString();
    }
}

/******************/
class ClientConnection {
    constructor (transport) {
        this.transport = transport;
        setInterval (()=>this.send('ping-pong'), 250);

        transport.on('disconnect',reason=>this.onDisconnect(reason));
        transport.on('ping-pong' ,()=>this.onPingPong());
        transport.on('message'   ,(...args)=>this.onRequest(...args));

        this.sendMessage({text:'Ready'});
    }

    onDisconnect (reason) {
    }
    onPingPong () {
    }
    onRequest (request) {
        const co = new VisionClientObject (this,request.text);
        v(request.text,co).then (
            result=>co.sendResponse (result),
            result=>co.sendResponse ("+++ ERROR: " + result)
        );
    }

    sendMessage (...message) {
        this.send('message',...message);
    }
    send(tag,...message) {
        this.transport.emit(tag,...message);
    }
}

/******************/
exports.listen = function(server) {
    const io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection',socket=>new ClientConnection (socket));
};
