/******************/

// const { RemoteLibrary } = require('remote-lib');
// const websocket = require('websocket-stream');

/******************/

var NewID = (
    function () {
	var nextId = 0;
	return function () {return nextId++;}
    }
)();

/******************/
function NewTranscriptEntry (builder) {
    const transcript=$('#transcript');
    const transcriptParent = transcript.parent();
    const transcriptHeight = transcriptParent.prop('scrollHeight');
    return (entry=>{
        builder(entry);
        transcript.append (entry);
        transcriptParent.scrollTop(transcriptHeight);
        return entry;
    })(TranscriptElement());
}

/******************/
function TranscriptElement () {
    return DIV ().addClass ('transcript-entry');
}

function DIV () {
    return $('<div></div>');
}

function PRE () {
    return $('<pre></pre>');
}

function Identified (element) {
    return element.attr ('id', 'element'+NewID ());
}

function EscapedContentElement(content) {
    return PRE().text (content);
}

function SystemContentElement(content) {
    return DIV().html(content);
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
function processGraphRequest(...args) {
    NewTranscriptEntry (
        entry=>showGraph(entry[0],...args)
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
class VDashTransport {
    constructor() {
    }
}

class VDashSocket extends VDashTransport {
    constructor() {
	super();
	this.socket = io.connect();

	this.socket.on('ping-pong', function (message) {});
	// setInterval (function() {socket.emit ('ping-pong');}, 750);

        this.socket.on('message', processResponse);
        this.socket.on('showGraph', processGraphRequest);
    }

    evaluate(text) {
        this.socket.emit ('message',{text});
    }
}

/******************/
function platformOSType() {
    var detectedOS;
    return detectedOS || (function (appv) {
        detectedOS =
            appv.indexOf("Win"  )!=-1 ? "Windows" :
            appv.indexOf("Mac"  )!=-1 ? "Mac"     :
            appv.indexOf("Linux")!=-1 ? "Linux"   :
            appv.indexOf("X11"  )!=-1 ? "Unix"	  :
            "Unknown";
        return detectedOS;
    })(navigator.appVersion);
}

function platformExtraKeys (extraKeys) {
    return Object.assign (
        extraKeys, {
            Linux: {
                "Ctrl-V": false // ... turn off 'Ctrl-V' if it's likely to be 'paste'
            },
            Unix: {
                "Ctrl-V": false // ... turn off 'Ctrl-V' if it's likely to be 'paste'
            },
            Windows: {
                "Ctrl-V": false // ... turn off 'Ctrl-V' if it's likely to be 'paste'
            }
        }[platformOSType()] || {}
    );
}

/******************/
class VDashUI {
    constructor(theApp) {
        this.theApp = theApp;
        this.editor = CodeMirror (
	    $('#input-area')[0], {
                mode: "smalltalk",
                lineNumbers: true,
                matchBrackets: true,
                showTrailingSpace: true,
                keyMap: "emacs",
                theme: "pastel-on-dark",
                extraKeys: platformExtraKeys ({
                    F2: cm=>this.processRequest(),
                    F11: cm=>cm.setOption("fullScreen", !cm.getOption("fullScreen")),
                    "Ctrl-S": "findPersistent",
                    "Alt-G": "jumpToLine",
                    "Ctrl-Q": cm=>cm.foldCode(cm.getCursor())
                }),
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                autofocus: true
            }
	);

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
    }

    processRequest() {
	var request = this.editor.getValue ();
	this.editor.setValue('');
        this.theApp.processRequest(request);
    }
}

/******************/
var theApp;

$(document).ready(function() {
    theApp = new VDashUI (new VDash (new VDashSocket ()));
});
