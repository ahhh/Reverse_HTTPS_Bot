# Reverse_HTTPS_Bot 0.6

#### Description:
  A python based https remote access trojan for penetration testing.

  Server is currently NodeJS based

#### Bot Requires:
  - pip install requests

#### Server Requires:
  - sh setup.sh
  - don't forget to change your server ip in the new SockJS object in index.html!
  - sudo npm install (restify, express, lodash, save, sockjs)

#### Instructions for generating ssl cert and key for testing
  - openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
  - openssl rsa -passin pass:x -in server.pass.key -out server.key
  - rm server.pass.key
  - openssl req -new -key server.key -out server.csr
  - openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

  
