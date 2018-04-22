function onRequestHover (event) {
    console.log ('request', event);
}

function onResponseHover (event) {
    console.log ('response', event);
}

function onTxnHover (event) {
}

/******************/
function LogEntry (request,response) {
    var element = $('<div></div>').addClass ('log-element');
    if (request)
        element.append (RequestElement (request));
    element.append (ResponseElement (response));
    return element;
}

function RequestElement (request) {
    return EscapedContentElement (request)
        .addClass('request');
}

function ResponseElement (response) {
    return (
        response.charAt(0) === "<"
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
    $('#messages').append (LogEntry (response.request,response.text));
}

/******************/
function onResizeHandler () {
    ((parent, child)=>{
        child.height (parent.height() - 5);
        child.width  (parent.width () - 5);
    }) ($(window), $('#content'));
}

/******************/
function splitLimiter (element, proposal, limit) {
    if (proposal > limit)
        return false;
}

/******************/
var theApp;

$(document).ready(function() {
    if (theApp)
        return;

    const socket = io.connect();

    theApp = new VDash (
	socket, CodeMirror (
	    $('#input-area')[0], {
                mode: "smalltalk",
                lineNumbers: true,
                matchBrackets: true,
                showTrailingSpace: true,
                keyMap: "emacs",
                theme: "pastel-on-dark",
                extraKeys: {
                    F2: cm=>theApp.processRequest(),
                    Tab: cm=>theApp.processRequest(),
                    F11: cm=>cm.setOption("fullScreen", !cm.getOption("fullScreen")),
                    "Ctrl-S": "findPersistent",
                    "Alt-G": "jumpToLine",
                    "Ctrl-Q": cm=>cm.foldCode(cm.getCursor())
                },
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                autofocus: true
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

    $('.splittable-column-first').resizable({
        handleSelector: '.splittable-column-splitter',
        resizeWidth: false,
        onDrag: function (e, element, newWidth, newHeight, opt) {
            if (newHeight > element.parent().height() - 25)
                return false;
        }
    });
    $('.splittable-row-first').resizable({
        handleSelector: '.splittable-row-splitter',
        resizeHeight: false,
        onDrag: function (e, element, newWidth, newHeight, opt) {
            if (newWidth > element.parent().width() - 30)
                return false;
        }
    });

    $(window).resize (onResizeHandler);
    $(window).resize ();
});
