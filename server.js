const express = require('express');
const http = require('http');
const path = require('path');

/*----------------*/
const app = express ();
app.use (express.static (path.join (__dirname, 'public')));
app.use ('/node_modules', express.static (path.join (__dirname, 'node_modules')));
module.exports.app = app;

/*----------------*/
const httpServer = http.createServer (app);
module.exports.httpServer = httpServer;

/*----------------*/
const visionServer = require('./lib/vision_server');
app.use ('/cgi-bin/vquery.exe', visionServer.VQueryHandler ());

module.exports.visionServer = visionServer;
module.exports.v = visionServer.v;

/*----------------*/
const chatServer = require('./lib/chat_server');
chatServer.listen(httpServer);
module.exports.chatServer = chatServer;

/*----------------*/
httpServer.listen(process.env.PORT || 3000, function() {
  console.log("Server listening on port 3000.");
});

/*
FormatTools Html evaluate: [Interface ApplicationWS ShowClassSummary];
*/
