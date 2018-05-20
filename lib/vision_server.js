const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const v = require('vxanode').v;

const consoleLogger = {
    enabled: false,
    log (...args) {
        this.enabled && console.log (...args);
    }
};
module.exports.consoleLogger = consoleLogger;

/******************/
function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += '<br>' + p;
        }
    }
    return str;
}

function quote (str) {
    return '"' + str.replace ('/"/g', '\\"') + '"';
}

/******************/
function formatVisionRequestAsHtml (req, message, requestBuilder) {
    var result = '<!DOCTYPE html><html><body><h2>' + req.originalUrl + '</h2>';

    if (message)
        result += message + '<hr>';

    result += ' path:'   + req.path + '<hr>';
    result += ' params:' + JSON.stringify (req.params)  + '<hr>';
    result += ' query:'  + JSON.stringify (req.query)   + '<hr>';
    result += ' headers:'+ JSON.stringify (req.headers) + '<hr>';
    result += ' vision:' + requestBuilder (req) + '<hr>';

    result += objToString (req);

    result += '</body></html>';
    return result;
}

/******************/
function getRequestExpression (req) {
    return probeRequest(req,part=>part.expression);
}

function probeRequest (req,f) {
    return (
        req.body && f(req.body)
    ) || (
        req.query && f(req.query)
    )
}

/******************/
function ClientObject (request, response, next) {
    return {
        global,
        request,
        response,
        next,
        getAppName () {
            return this.getParam ("app");
        },
        getExpression () {
            return getRequestExpression(this.request);
        },
        getQueryID () {
            return probeRequest (this.request,part=>part.queryID);
        },
        getQueryString () {
            return querystring.stringify (this.request.query);
        },
        getParam (property) {
            return this.getProperty (this.request.params, property);
        },
        getQuery (property) {
            return this.getProperty (this.request.query, property);
        },
        getProperty (object, property) {
            return object.hasOwnProperty (property) ? object[property] : "";
        },
        isFinished () {
            return this.response.finished;
        },

        returnJSON (result) {
            consoleLogger.log ({
                queryID: this.getQueryID (),
                action: "Returning JSON",
                finished: this.isFinished(),
                vx: this.getExpression (),
                result
            });
            return this.response
//                .set ('Content-Type', 'application/json')
                .json (result)
                .end ();
        },
        returnResult (result) {
            consoleLogger.log ({
                queryID: this.getQueryID (),
                action: "Returning Result",
                finished: this.isFinished(),
                vx: this.getExpression (),
                result
            });
            return this.response.send (result).end ();
        },
        returnError (result) {
            return this.response.send (result).end ();
        }
    };
}

/******************/
function usingInterfaceHtmlAccess (req) {
    return (
        "'co' locateInDictionaryOf: Utility. else: [Utility define: \"co\" toBePrimitive: 7]; !reqres <- Utility co;"
    ) + "Interface HtmlAccess get: " + quote (
        (req.params.app || '')
    ) + " usingQuery: " + quote (
        querystring.stringify (req.query)
    ) + " for: " + quote (
        req.hostname
    ) + " at: " + quote (
        req.ip
    );
}

function usingAppBridgeExecute (req) {
    return "AppBridgeTools executeWith: AppBridgeTools clientObject";
}

function usingAppBridgeEvaluate (req) {
    return "AppBridgeTools evaluate: AppBridgeTools clientObject";
}

function usingRequestExpression (req) {
    return getRequestExpression (req) || "";
}

/******************/
function RouteHandler (requestFormatter) {
    return function (req, res, next) {
        const vx = requestFormatter (req);
        const co = ClientObject (req, res, next);

        consoleLogger.log ({
            queryID: co.getQueryID (),
            action: "Starting Request",
            vx
        });

        const prodId=setInterval(()=>{},30);
        const stopProdding=()=>clearInterval(prodId);
        v (vx, co).then (
            str => {
                stopProdding();
                consoleLogger.log ({
                    queryID: co.getQueryID(),
                    action: "Cleanup",
                    finished: res.finished,
                    vx,
                    str
                });
                if (!res.finished) {
                    co.returnResult (str);
                }
            },
            str => {
                stopProdding();
                if (!res.finished) {
                    co.returnError (
                        formatVisionRequestAsHtml (req, str, requestFormatter)
                    )
                }
            }
        );
    }
}

function App () {
    const app = express ();
//    app.use(cors());
    app.use(['/api', '/bare'],
            RouteHandler (usingRequestExpression));
    app.use(['/:target/:app',
             '/:target',
             '/'],
            RouteHandler (usingAppBridgeExecute));
    return app;
}

module.exports.app = App();
module.exports.v = v;
