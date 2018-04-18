function onRequestHover (event) {
    console.log ('request', event);
}

function onResponseHover (event) {
    console.log ('response', event);
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

function processResponse(response) {
    $('#messages').append (TxnElement (response.request,response.text));
}

/******************/
function displayHandW (selector) {
    var el = $(selector);
    console.log (
        selector, el.height (), el.width (), el.innerHeight (), el.innerWidth ()
    );
}

function onResizeHandler () {
    ((parent, child)=>{
        child.height (parent.height() - 5);
        child.width  (parent.width () - 5);
    }) ($(window), $('#content'));
}

/******************/
var theApp;

$(document).ready(function() {
    if (theApp)
        return;

    const socket = io.connect();

    theApp = new Chat(
	socket, CodeMirror (
	    $('#input-area')[0], {
                mode: "smalltalk",
                lineNumbers: true,
                keyMap: "emacs",
                extraKeys: {
                    F2: cm=>theApp.processRequest(),
                    "Alt-S": "findPersistentNext"
                }
            }
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

    $('.splittable-column-top').resizable({
        handleSelector: '.splittable-column-splitter',
        resizeWidth: false
    });

    $(window).resize (onResizeHandler);
    $(window).resize ();
});
