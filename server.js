const express = require('express');
const fs = require('fs');
const http = require('http');
const morgan = require('morgan');
const path = require('path');

/*-------------------*/
/*----  express  ----*/
/*-------------------*/
const app = express ();
module.exports.app = app;

/*-----------------*/
/*---- logging ----*/
/*-----------------*/
app.use (
    morgan (
        'tiny', {
            stream: fs.createWriteStream(
                path.join(__dirname, '/logs', 'access.log'), {flags: 'a'}
            )
        }
    )
);

/*--------------------------*/
/*----  static content  ----*/
/*--------------------------*/
app.use (express.static (path.join (__dirname, 'public')));
app.use ('/node_modules', express.static (path.join (__dirname, 'node_modules')));

/*-----------------------*/
/*----  http server  ----*/
/*-----------------------*/
const httpServer = http.createServer (app);
module.exports.httpServer = httpServer;

/*--------------------------*/
/*----  the good stuff  ----*/
/*--------------------------*/

/*----------------*/
const visionServer = require('./lib/vision_server');
module.exports.visionServer = visionServer;
module.exports.v = visionServer.v;
app.use ('/cgi-bin/vquery.exe', visionServer.VQueryHandler ());

/*----------------*/
const chatServer = require('./lib/chat_server');
module.exports.chatServer = chatServer;
chatServer.listen(httpServer);

/*----------------*/
httpServer.listen(process.env.PORT || 3000, function() {
  console.log("Server listening on port 3000.");
});

/*
FormatTools Html evaluate: [Interface ApplicationWS ShowClassSummary];
*/
