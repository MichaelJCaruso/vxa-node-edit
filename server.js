const express = require('express');
const fs  = require('fs');
const http = require('http');
const mime = require('mime');
const path = require('path');
const querystring = require('querystring');
const v = require('vxanode').v;
const cache = {};

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200, 
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

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

function formatVisionExpression (req) {
    var vexpr = "'co' locateInDictionaryOf: Utility. else: [Utility define: \"co\" toBePrimitive: 7]; !reqres <- Utility co;"
    vexpr += "Interface HtmlAccess get: " + quote (
        req.params.app + ((extras)=>extras ? '@' + extras : '')(req.params.extras)
    ) + " usingQuery: " + quote (
        querystring.stringify (req.query)
    ) + " for: " + quote (
        req.hostname
    ) + " at: " + quote (
        req.ip
    );
    console.log (vexpr);
    return vexpr;
}

function formatVisionRequest (req, message) {
    var result = '<!DOCTYPE html><html><body><h2>' + req.originalUrl + '</h2>';

    if (message)
        result += message + '<hr>';

    result += ' path:'   + req.path + '<hr>';
    result += ' params:' + JSON.stringify (req.params)  + '<hr>';
    result += ' query:'  + JSON.stringify (req.query)   + '<hr>';
    result += ' headers:'+ JSON.stringify (req.headers) + '<hr>';
    result += ' vision:' + formatVisionExpression (req) + '<hr>';

    result += objToString (req);

    result += '</body></html>';
    return result;
}

function returnVisionResult (res, str) {
    res.send (str). end ();
}

function processVisionRequest (req, res, next) {
    v (formatVisionExpression (req), {req, res}).then (
        (str) => returnVisionResult (res, str),
        (str) => returnVisionResult (formatVisionRequest (req, str))
    );
}

/*----------------*/
var app = express ();
app.use ('/cgi-bin/vquery.exe/:target/:app@:extras', processVisionRequest);
app.use ('/cgi-bin/vquery.exe/:target/:app', processVisionRequest);
app.use (express.static (path.join (__dirname, 'public')));

exports.app = app;

/*----------------*/
var httpServer = http.createServer (app);
exports.httpServer = httpServer;

/*----------------*/
var chatServer = require('./lib/chat_server');
chatServer.listen(httpServer);
exports.chatServer = chatServer;

/*----------------*/
httpServer.listen(3000, function() {
  console.log("Server listening on port 3000.");
});

/*
FormatTools Html evaluate: [Interface ApplicationWS ShowClassSummary];
*/
