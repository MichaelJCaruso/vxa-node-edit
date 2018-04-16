var Chat = function(socket, editor) {
  this.editor = editor;
  this.socket = socket;
};

Chat.prototype.processRequest = function () {
    var request = this.editor.getValue ();
    this.editor.setValue('');
    console.log ("Edit Request: ", request);
    this.sendMessage(request);
}

Chat.prototype.sendMessage = function(text) {
  var message = {
    text: text
  };
  this.socket.emit('message', message);
};
