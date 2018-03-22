const express = require('express');
const http = require('http');
const fs  = require('fs');
const path = require('path');
const mime = require('mime');
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
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

/*----------------*/
var app = express ();
app.use ('/cgi-bin/vquery.exe/default', function (req, res, next) {
    var result = '<!DOCTYPE html><html><body><h2>' + req.originalUrl + '</h2>';
    result += ((obj)=> {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += '<br>' + p;
            }
        }
        return str;
    }) (req);
    result += '</body></html>';
    res.send(result).end ();
});
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
