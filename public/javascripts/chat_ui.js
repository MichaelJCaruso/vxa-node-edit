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

function onTextAreaResize (area, handler) {
    area.on("mouseup", handler)
};

function updateMessageAreaHeight () {
    $('#message-area').height(
	Math.max (
	    $(window).height()
		- $('#send-form-area').height()
		- $('#viz').height()
		- 20,
	    100
	)
    );
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
//	    $('#messages').scrollTop($('#messages').prop('height'));
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

    updateMessageAreaHeight ();
    $(window).resize (updateMessageAreaHeight);

    (area => {
	onTextAreaResize (area, updateMessageAreaHeight);
	area.focus ();
    }) ($('#send-message'));

    $('#send-form').submit(function() {
	processUserInput(chatApp, socket);
	return false;
    });
});
