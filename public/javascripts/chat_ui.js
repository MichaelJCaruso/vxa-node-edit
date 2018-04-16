function onRequestHover (event) {
    console.log ('request', event);
}

function onResponseHover (event) {
    console.log ('response', event);
}

function processUserInput(chatApp, doc, socket) {
    var message = chatApp.editor.getValue ();
    chatApp.sendMessage(message);
    chatApp.editor.setValue('');
}

function onTxnHover (event) {
}

/******************/
function TxnElement (request,response) {
    var element = $('<div"></div>').addClass ('txn');
    if (request)
        element.append (RequestText (request));
    element.append (ResponseText (response));
    return element;
}

function RequestText (request) {
    return EscapedContentElement (request)
        .addClass('request')
        .hover(onRequestHover);
}

function ResponseText (response) {
    return (
        response.substring (0,1) === "<"
	    ? SystemContentElement (response)
	    : EscapedContentElement (response)
    ).addClass ('response');
}

function EscapedContentElement(content) {
    return $('<pre></pre>').text (content);
}

function SystemContentElement(content) {
  return $('<div></div>').html(content);
}

function processRequest(chatApp) {
  var request = $('#send-message').val();
  $('#send-message').val('');

  chatApp.sendMessage(request);
}

function processResponse(response) {
    $('#messages').append (TxnElement (response.request,response.text));
}

/******************/
function onTextAreaResize (area, handler) {
    area.on("mouseup", handler)
};

/******************/
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

/******************/
$(document).ready(function() {
    const socket = io.connect();

    const chatApp = new Chat(
	socket, CodeMirror.fromTextArea (
	    $('#send-message')[0], { mode: "smalltalk" }
	)
    );

    socket.on('message', processResponse);
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
	processRequest(chatApp);
	return false;
    });
});
