import os,hashlib,re
from sys import argv
from urllib.parse import unquote
from http.server import BaseHTTPRequestHandler, HTTPServer

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        print(self.path)
        self._set_headers()

        path = ''
        filename = ''
        raw_path = re.sub('^(\.{1,2}\/)*','',unquote(self.path)).strip('/').lower()
        url_parts = raw_path.split('?')
        if len(url_parts) == 1:
            path_parts = url_parts[0].split('/')   
            if len(path_parts) == 1:
                if path_parts[0] == '':
                    filename = 'index.html'
                else:
                    filename = path_parts[0] + '.html' if '.' not in path_parts[0] else path_parts[0]
            elif len(path_parts) > 1:
                path = '/'.join(path_parts[:-1])
                filename = path_parts[-1] + '.html' if '.' not in path_parts[-1] else path_parts[-1]
        elif len(url_parts) == 2:
            if url_parts[0] == '':
                path = 'index'
            else:
                path = url_parts[0].split('.')[0]
            filename = '%s.html'%(hashlib.md5(url_parts[1].encode()).hexdigest())

        file_path = os.path.join(path,filename)
        print(file_path)
        if os.path.exists(file_path):
            content = open(file_path,'rb').read()
            self.wfile.write(content)

def run(server_class=HTTPServer, handler_class=S, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()