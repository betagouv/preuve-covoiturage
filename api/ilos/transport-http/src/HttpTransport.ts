import http from 'http';

import { TransportInterface, KernelInterface, RPCCallType, RPCResponseType } from '@ilos/common';

import { mapStatusCode } from './helpers/mapStatusCode';

/**
 * Http Transport
 * @export
 * @class HttpTransport
 * @implements {TransportInterface}
 */
export class HttpTransport implements TransportInterface<http.Server> {
  protected server: http.Server;
  protected kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  getInstance(): http.Server {
    return this.server;
  }

  async up(opts: string[] = []) {
    this.server = http.createServer((req, res) => {
      res.setHeader('Content-type', 'application/json');

      if (
        !('content-type' in req.headers && 'accept' in req.headers) ||
        req.headers['content-type'] !== 'application/json' ||
        req.headers.accept !== 'application/json'
      ) {
        res.statusCode = 415;
        res.end(
          JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Wrong Content-type header. Requires application/json',
            },
          }),
        );
      }
      // Add Host/Origin check

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(
          JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: 'Method not allowed',
            },
          }),
        );
      }

      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          // Add Length check
          if (Number(req.headers['content-length']) !== data.length + 1) {
            // console.log(Number(req.headers['content-length']), data.length)
            // TODO repair, this is not working
            // throw new Error();
          }

          const call: RPCCallType = JSON.parse(data);
          // TODO : add channel ?
          this.kernel
            .handle(call)
            .then((results: RPCResponseType) => {
              res.statusCode = mapStatusCode(results);
              res.end(JSON.stringify(results));
            })
            .catch((e) => {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  id: 1,
                  jsonrpc: '2.0',
                  error: {
                    code: -32000,
                    message: e.message,
                  },
                }),
              );
            });
        } catch (err) {
          res.statusCode = 415;
          res.end(
            JSON.stringify({
              id: 1,
              jsonrpc: '2.0',
              error: {
                code: -32000,
                message: 'Wrong content length',
              },
            }),
          );
        }
      });

      req.on('error', () => {
        res.statusCode = 400;
        res.end();
      });
    });

    // Passing 0 as port lets the net stack use a random free port
    const optsPort = parseInt(opts[0], 10);
    const port = optsPort || optsPort === 0 ? optsPort : 8080;

    this.server.listen(port);
  }

  async down() {
    this.server.close();
  }
}
