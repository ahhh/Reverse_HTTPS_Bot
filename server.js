var restify = require('restify');
var userSave = require('save')('user');

var ADMIN_HOST = 'localhost';
var fs = require('fs');
var https = require('https');

var PORT = 443;

var server = restify.createServer({
  name: 'BAPI',
  certificate: fs.readFileSync('server.crt'),
  key: fs.readFileSync('server.key'),
});

server.use(function checkIP (req, res, next) {
  if (ADMIN_HOST !== req.headers.host) {
    console.log("Unauthorized IP: " + req.ip);
    res.send("Unauthorized.");
  }
  next();
});

// Main Controller
server.get('/', restify.serveStatic({
  directory: './public',
  default: 'index.html',
}));

// Bot Command
server.get('/command', function(req, res) {
  var date = new Date();  
  console.log("Command Recieved:", date, res.connection.remoteAddress,
              req.url, req.headers['user-agent']);
  fs.readFile('./command', function(err, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

// Post of Bot Output
server.post('/out', function(req, res) {
  var date = new Date();  
  console.log("Command Recieved:", date, res.connection.remoteAddress,
              req.url, req.headers['user-agent']);
  var body = "";
    req.on('data', function (chunk) {
    body += chunk;
  });
  //Write post to file  
  var stream = fs.createWriteStream("out.txt");  
  stream.once('open', function() {
    stream.write(body);
    stream.end();
  });
  //Return 200
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('ok', 'utf-8');
});

server.listen(PORT, function() {
  console.log("Listening on port "+PORT+"....");
});
