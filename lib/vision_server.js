const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const v = require('vxanode').v;

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
    return (
        req.body && req.body.expression
    ) || (
        req.query && req.query.expression
    );
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

        returnResult (str) {
            return this.response.send (str).end ();
        },
        returnError (str) {
            return this.response.send (str).end ();
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
function concludeRequest (req,res,co,str,requestFormatter) {
}

/******************/
function RouteHandler (requestFormatter) {
    return function (req, res, next) {
        const vx = requestFormatter (req);
        const co = ClientObject (req, res, next);

        const prodId=setInterval(()=>{},30);
        const stopProdding=()=>clearInterval(prodId);

        v (vx, co).then (
            str => {
                stopProdding();
                if (!res.finished) {
                    co.returnResult (str);
                }
            },
            str => {
                stopProdding();
                co.returnError (
                    formatVisionRequestAsHtml (req, str, requestFormatter)
                )
            }
        );
    }
}

function VQueryHandler () {
    const app = express ();
    app.use(cors());
    app.use('/bare',
            RouteHandler (usingRequestExpression));
    app.use('/evaluate',
            RouteHandler (usingAppBridgeEvaluate));
    app.use(['/:target/:app',
             '/:target',
             '/'],
            RouteHandler (usingAppBridgeExecute));
    return app;
}

module.exports.v = v;
module.exports.vquery = VQueryHandler();
