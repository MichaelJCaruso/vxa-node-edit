const express = require('express');
const querystring = require('querystring');
const v = require('vxanode').v;

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

function requestTypeVQuery1 (req) {
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

function requestTypeVQuery2 (req) {
    return "AppBridgeTools executeWith: AppBridgeTools clientObject";
}

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

function ClientObject (req, res, next) {
    return {
        global,
        request  : req,
        response : res,
        next,
        getAppName : function () {
            return this.getParam ("app");
        },
        getQueryString : function () {
            return querystring.stringify (this.request.query);
        },
        getParam : function (property) {
            return this.getProperty (this.request.params, property);
        },
        getQuery : function (property) {
            return this.getProperty (this.request.query, property);
        },
        getProperty: function (object, property) {
            return object.hasOwnProperty (property) ? object[property] : "";
        },

        returnResult: function (str) {
            return this.response.send (str).end ();
        },
        returnError: function (str) {
            return this.response.send (str).end ();
        }
    };
}

function RouteHandler (requestedFormatter) {
    const requestFormatter = requestedFormatter || requestTypeVQuery2;
    return function (req, res, next) {
        const vx = requestFormatter (req);
        const co = ClientObject (req, res, next);
        v (vx, co).then (
            str => {}, str => co.returnError (
                formatVisionRequestAsHtml (req, str, requestFormatter)
            )
        );
    }
}

function VQueryHandler (requestedFormatter) {
    const requestProcessor = RouteHandler (requestedFormatter);
    const app = express ();
    app.use ('/:target/:app', requestProcessor);
    app.use ('/:target'     , requestProcessor);
    return app;
}

module.exports.v = v;
module.exports.requestTypeVQuery1 = requestTypeVQuery1;
module.exports.requestTypeVQuery2 = requestTypeVQuery2;
module.exports.RouteHandler = RouteHandler;
module.exports.VQueryHandler = VQueryHandler;


