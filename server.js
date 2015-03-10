var restify = require('restify');
var userSave = require('save')('user');

var fs = require('fs');
var https = require('https');

var PORT = 443;

var server = restify.createServer({
  name: 'BAPI',
  certificate: fs.readFileSync('server.crt'),
  key: fs.readFileSync('server.key'),
});

// Bot Command
server.get('/command', function(req, res) {
  var date = new Date();  
  console.log("Command Recieved:", date, res.connection.remoteAddress, req.url, req.headers['user-agent']);
  fs.readFile('./command', function(err, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

// Post of Bot Output
server.post('/out', function(req, res) {
  console.log("Writing Output.");
  //Reassemble body of post
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
  //log all access requests
  console.log("Listening on port "+PORT+"....");
  //var date = new Date();
  //console.log('request:', date, req.url, req.headers['user-agent']);
});
