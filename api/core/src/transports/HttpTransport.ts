import http from 'http';

import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';

export class HttpTransport implements TransportInterface {
  server: http.Server;
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  up() {
    this.server = http.createServer((req, res) => {
      if (
          !('content-type' in req.headers && 'accept' in req.headers)
          || (req.headers['content-type'] !== 'application/json')
          || (req.headers.accept !== 'application/json')
        ) {
        res.statusCode = 415;
        res.end('Wrong content type header');
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
      }

      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const call = JSON.parse(data);
          this.kernel.handle(call)
            .then((results) => {
              res.setHeader('content-type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(results));
            })
            .catch((e) => {
              res.statusCode = 500;
              res.end(`An error occured : ${e ? e.message : ''}`);
            });
        } catch (e) {
          res.statusCode = 415;
          res.end('Wrong request');
        }
      });

      req.on('error', () => {
        res.statusCode = 400;
        res.end();
      });
    });
    this.server.listen(8080);
  }

  down() {
    this.server.close();
  }
}
