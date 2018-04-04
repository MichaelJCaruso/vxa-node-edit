var Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function(text) {
  var message = {
    text: text
  };
  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};
