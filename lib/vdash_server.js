// const { Library } = require('remote-lib');
// const websocket = require('websocket-stream');

const socketio = require('socket.io');
const v = require('vxanode').v;

/******************/
class VisionClientObject {
    constructor (connection,requestObj) {
	this.connection = connection;
        this.requestObj = requestObj;
    }
    request () {
        return this.requestObj.text;
    }
    sendResponse (response) {
        this.connection.sendResponse(response,this.requestObj);
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
    onRequest (request,cb) {
        const co = new VisionClientObject (this,request);
        v(request.text,co).then (
            response=>this.sendResponse (response,request,cb),
            response=>this.sendResponse ("+++ ERROR: " + response,request,cb)
        );
    }

    sendResponse(response,request,cb) {
        (responseObj => cb ? cb(responseObj) : this.sendMessage(responseObj)) (
            {request: request.text, text: response}
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
