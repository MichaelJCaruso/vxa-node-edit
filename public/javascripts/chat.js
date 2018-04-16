var Chat = function(socket, editor) {
  this.editor = editor;
  this.socket = socket;
};

Chat.prototype.sendMessage = function(text) {
  var message = {
    text: text
  };
  this.socket.emit('message', message);
};
