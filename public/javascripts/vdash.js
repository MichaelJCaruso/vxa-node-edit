class VDash {
    constructor(socket,editor) {
	this.editor = editor;
	this.socket = socket;
    }

    processRequest() {
	var request = this.editor.getValue ();
	this.editor.setValue('');
	console.log ("Edit Request: ", request);
	this.sendMessage(request);
    }

    sendMessage(text) {
	var message = {
	    text: text
	};
	this.socket.emit('message', message);
    };
}

/*****************
var VDash = function(socket, editor) {
  this.editor = editor;
  this.socket = socket;
};

VDash.prototype.processRequest = function () {
    var request = this.editor.getValue ();
    this.editor.setValue('');
    console.log ("Edit Request: ", request);
    this.sendMessage(request);
}

VDash.prototype.sendMessage = function(text) {
  var message = {
    text: text
  };
  this.socket.emit('message', message);
};
*****************/
