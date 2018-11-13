const socketio = require('socket.io');
const v = require('@vision-dbms/connect').v;

/******************/
class VisionClientObject {
    constructor (connection,requestObj) {
	this.connection = connection;
	this.requestObj = requestObj;
	this.remote = this.connection.remoteProxy;
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
class RemoteObject {
    constructor (socket) {
	this.socket = socket;
    }
    get(target,property,receiver) {
	let self=this;
	console.log ('remote get: ', property);
	//================
	//  The intercepted 'get' we are handling could be associated with a
	//  method call {e.g., someObject.foo(a,b,...)} or a property access
	//  {e.g., var x = someObject.foo}.  In the property access case, we
	//  SHOULD return a 'Promise' for the remote property's value.  In
	//  the method call case, we MUST return a function (or 'Proxy' for
	//  one).  The difficulty is that we don't know which case we're
	//  dealing with in advance, do not know the 'typeof' of the remote
	//  property's value (even if we keep a cache), and cannot fully
	//  compensate for an incorrect decision after the fact.
	//
	//  To illustrate, returning a function-like object ensures that
	//  method calls work correctly.  In the method call case, that
	//  function will be called immediately giving it the opportunity
	//  to return a 'Promise' for the remote method's result.  The
	//  function itself will NEVER be visible to the application.  If,
	//  on the other hand, this 'get' intercept is being made on behalf
	//  of a simple property access, the function is not called but
	//  instead returned to application code expecting a 'Promise',
	//  not a function.  One workaround is to make the function appear
	//  'Promise'-like by making it 'then'-able; however the resulting
	//  duck-typed object IS still a function and can be (mis-)used as
	//  one. The onus of preventing that is entirely on the application;
	//  the abstraction has leaked and there appears to be nothing that
	//  can be donw to prevent it.
	//================
        return function (...argumentArray) {
	    console.log('remote get: ', property, argumentArray);
            return self.socket.sendRemoteGet(property,argumentArray);
        }
    }
    set(target,property,value,receiver) {
        return this.socket.sendRemoteSet(property,value);
    }
    apply (target,thisObject,argumentArray) {
	return this.socket.sendRemoteCall(argumentArray);
    }
}

/******************/
class RemoteProxy {
    constructor (socket) {
        Object.setPrototypeOf(
            this, new Proxy(function(){},new RemoteObject (socket))
        );
    }
}

/******************/
class RemoteConnection {
    constructor (socket) {
        this.socket = socket;
	this.remoteProxy = new RemoteProxy (this);

        socket.on('disconnect',reason=>this.onDisconnect(reason));
        socket.on('message'   ,(...args)=>this.onRequest(...args));

        this.sendMessage({text:'Ready'});
    }

    onDisconnect (reason) {
    }
    onRequest (request,cb) {
        const co = new VisionClientObject (this,request);

        v(request.text,co).then (
            response=>this.sendResponse (response,request,cb),
            response=>this.sendResponse ("+++ ERROR: " + response,request,cb)
        );
    }

    sendRemoteGet(property,...rest) {
	console.log ('sendRemoteGet: ', property, rest);
	return new Promise(
	    (resolve,reject)=>{
		this.send(
		    'proxyGet',property,...rest,result=>resolve(result)
		)
	    }
	);
    }
    sendRemoteSet(property,...rest) {
	this.send('proxySet',property,...rest);
	return true;
    }
    sendRemoteCall(...rest) {
	return new Promise(
	    (resolve,reject)=>{
		this.send(
		    'proxyCall',...rest,result=>resolve(result)
		)
	    }
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
        this.socket.emit(tag,...message);
    }
}

/******************/
exports.listen = function(server) {
    const io = socketio.listen(server);
    io.sockets.on('connection',socket=>new RemoteConnection (socket));
};
