# Reverse_HTTPS_Bot 0.3

#### Description:
  A python based https remote access trojan for penetration testing.

  Server is currently NodeJS based

#### Bot Requires:
  - requests

#### Server Requires:
  - ssl certificate and key

#### Instructions for generating ssl cert and key for testing
  - openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
  - openssl rsa -passin pass:x -in server.pass.key -out server.key
  - rm server.pass.key
  - openssl req -new -key server.key -out server.csr
  - openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

  
