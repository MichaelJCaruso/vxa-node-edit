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
app.use ('/cgi-bin/vquery.exe', visionServer.vquery);

/*----------------*/
const vdashServer = require('./lib/vdash_server');
module.exports.vdashServer = vdashServer;
vdashServer.listen(httpServer);

/*----------------*/
var port = process.env.PORT || 3000;
httpServer.listen(port, function() {
  console.log("Server listening on port " + port);
});

/*
FormatTools Html evaluate: [Interface ApplicationWS ShowClassSummary];
*/
