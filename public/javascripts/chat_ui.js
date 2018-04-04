function divEscapedContentElement(message) {
    return $('<pre></pre>').text (message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html(message);
}

function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  chatApp.sendMessage(message);
  $('#messages').append(divEscapedContentElement(message));
  $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function() {
    var chatApp = new Chat(socket);

    socket.on(
	'message', function (message) {
	    var messageText = message.text;
	    var newElement = messageText.substring (0,1) === "<"
		? divSystemContentElement (messageText)
		: divEscapedContentElement (messageText);
	    $('#messages').append(newElement);
	    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
    );
    socket.on(
	'showGraph', function (source) {
	    console.log ("Got showGraph " + source);
	    showGraph (source);
	}
    );

    socket.on('ping-pong', function (message) {});

//  setInterval (function() {socket.emit ('ping-pong');}, 750);

    $('#send-message').focus();

    $('#send-form').submit(function() {
	processUserInput(chatApp, socket);
	return false;
    });
});
