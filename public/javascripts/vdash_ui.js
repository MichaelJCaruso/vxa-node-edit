/******************/

var NewID = (function () {var nextId = 0; return function () {return nextId++;}})();

/******************/
function NewTranscriptEntry (builder) {
    return (entry=>{
        builder(entry);
        $('#messages').append (entry);
        return entry;
    })(TranscriptElement());
}

/******************/
function TranscriptElement () {
    return $('<div></div>')
        .addClass ('transcript-entry');
}
    
function SVGElement () {
    return $('<svg style="width:100%;height:100%;"></svg>')
        .attr('id', "svg_"+NewID());
}

function EscapedContentElement(content) {
    return $('<pre></pre>').text (content);
}

function SystemContentElement(content) {
    return $('<div></div>').html(content);
}

/******************/
function processResponse(response) {
    NewTranscriptEntry (
        entry=>{
            AppendRequest (entry, response.request);
            AppendResponse(entry, response.text);
            return entry;
        }
    );
}

function AppendRequest (container,request) {
    if (request) {
        container.append (
            EscapedContentElement (request)
                .addClass('request')
        );
    }
}

function AppendResponse (container,response) {
    container.append (
        (response.charAt(0) === "<"
	 ? SystemContentElement (response)
	 : EscapedContentElement (response)
        ).addClass ('response')
    );
}

/******************/
function processGraphRequest(...source) {
    NewTranscriptEntry (
        entry=>{
            var svg = SVGElement();
            entry.append(svg);
	    showGraph (svg, ...source);
        }
    );
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
    socket.on('showGraph', processGraphRequest);

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
