/******************/

// const { RemoteLibrary } = require('remote-lib');
// const websocket = require('websocket-stream');

/******************/
var theUI;

/******************/
var NewID = (
    function () {
	var nextId = 0;
	return function () {return nextId++;}
    }
)();

function Identified (element) {
    return element.attr ('id', 'element'+NewID ());
}

/******************/
class VDashTransport {
    constructor() {
    }
    onResponse(ui,response) {
        ui.addTranscriptResponse(response)
    }
}

/******************/
class VDashSocket extends VDashTransport {
    constructor() {
	super();
	this.socket = io.connect();

	this.socket.on('ping-pong', (message)=>{});
	// setInterval (function() {socket.emit ('ping-pong');}, 750);

        this.socket.on('message'  , (message)=>this.onResponse(theUI,message));
        this.socket.on('showGraph', (...args)=>theUI.addTranscriptGraph(...args));
    }

    evaluate(expression,ui) {
        this.socket.emit (
	    'message',{text: expression},response=>this.onResponse(ui,response)
	);
    }
}

/******************/
class VDashEditor {
    constructor (domElement,evaluator) {
        this.editor = CodeMirror (
	    domElement, {
                mode: "smalltalk",
                lineNumbers: true,
                matchBrackets: true,
                showTrailingSpace: true,
                keyMap: "emacs",
                theme: "pastel-on-dark",
                extraKeys: VDashEditor.platformExtraKeys ({
                    F2: cm=>VDashEditor.callEvaluator(evaluator,cm),
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
    }

    /******/
    static callEvaluator(evaluator,cm) {
        evaluator(this.getExpression(cm));
    }

    /******/
    static getExpression(cm) {
        return cm.getSelections()[0] || (
            ()=>{
                const value=cm.getValue();
	        cm.setValue('');
                return value;
            }
        )();
    }

    /******/
    static platformExtraKeys (extraKeys) {
        return CodeMirror.normalizeKeyMap (
            Object.assign (
                extraKeys, {
                    Linux: {
                        "Ctrl-V" : false  // ... disable 'Ctrl-V' if it's likely to be 'paste'
                    },
                    Unix: {
                        "Ctrl-V" : false  // ... disable 'Ctrl-V' if it's likely to be 'paste'
                    },
                    Windows: {
                        "Ctrl-V" : false  // ... disable 'Ctrl-V' if it's likely to be 'paste'
                    }
                }[this.platformOSType()] || {}
            )
        );
    }

    /******/
    static platformOSType() {
        return (
            (appv)=>
                appv.indexOf("Win"  )!=-1 ? "Windows" :
                appv.indexOf("Mac"  )!=-1 ? "Mac"     :
                appv.indexOf("Linux")!=-1 ? "Linux"   :
                appv.indexOf("X11"  )!=-1 ? "Unix"    :
                "Unknown"
        )(navigator.appVersion);
    }
}

/******************/
class VDashUI {
    constructor(theApp) {
        this.theApp = theApp;
        this.editor = new VDashEditor (
            $('#input-area')[0],expression=>this.evaluate(expression)
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

        this.window = $(window);
        this.content = $('#content');
        this.transcript = $('#transcript');

        this.window.resize (e=>this.onResize(e));
        this.window.resize ();
    }

    /******/
    evaluate(expression) {
        this.theApp.evaluate(expression,this);
    }

    /******/
    addTranscriptEntry (builder) {
        const transcriptParent = this.transcript.parent();
        const transcriptHeight = transcriptParent.prop('scrollHeight');
        return (entry=>{
            builder(entry);
            this.transcript.append (entry);
            transcriptParent.scrollTop(transcriptHeight);
            return entry;
        })(this.constructor.TranscriptElement());
    }

    addTranscriptGraph(...args) {
        this.addTranscriptEntry (
            entry=>showGraph(entry[0],...args)
        );
    }
    addTranscriptResponse(response) {
        this.addTranscriptEntry (
            entry=>{
                this.constructor.AppendRequest (entry, response.request);
                this.constructor.AppendResponse(entry, response.text);
                return entry;
            }
        );
    }

    /******/
    onResize (e) {
        this.content.height (this.window.height() - 5);
        this.content.width  (this.window.width () - 5);
    }

    /******/
    static TranscriptElement () {
        return this.DIV ().addClass ('transcript-entry');
    }

    /******/
    static AppendRequest (container,request) {
        if (request) {
            container.append (
                this.EscapedContentElement (request)
                    .addClass('transcript-request')
            );
        }
    }

    static AppendResponse (container,response) {
        container.append (
            (response.charAt(0) === "<"
	     ? this.SystemContentElement (response)
	     : this.EscapedContentElement (response)
            ).addClass ('transcript-response')
        );
    }

    /******/
    static EscapedContentElement(content) {
        return this.PRE().text (content);
    }

    static SystemContentElement(content) {
        return this.DIV().html(content);
    }

    /******/
    static DIV () {
        return $('<div></div>');
    }

    static PRE () {
        return $('<pre></pre>');
    }

}

/******************/
$(document).ready(function() {
    theUI = new VDashUI (new VDash (new VDashSocket ()));
});
