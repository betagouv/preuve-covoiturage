import { http } from "@/deps.ts";
import {
  KernelInterface,
  RPCCallType,
  RPCResponseType,
  TransportInterface,
} from "@/ilos/common/index.ts";
import { mapStatusCode } from "./helpers/mapStatusCode.ts";

/**
 * Http Transport
 * @export
 * @class HttpTransport
 * @implements {TransportInterface}
 */
export class HttpTransport implements TransportInterface<http.Server> {
  protected server: http.Server | null = null;

  constructor(protected kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  getInstance(): http.Server | void {
    if (this.server) return this.server;
  }

  async up(opts: string[] = []) {
    this.server = http.createServer((req, res) => {
      res.setHeader("Content-type", "application/json");

      if (
        !("content-type" in req.headers && "accept" in req.headers) ||
        req.headers["content-type"] !== "application/json" ||
        req.headers.accept !== "application/json"
      ) {
        res.statusCode = 415;
        res.end(
          JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Wrong Content-type header. Requires application/json",
            },
          }),
        );
        return;
      }
      // Add Host/Origin check

      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end(
          JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: "Method not allowed",
            },
          }),
        );
        return;
      }

      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });

      req.on("error", () => {
        res.statusCode = 400;
        res.end();
      });

      req.on("end", () => {
        try {
          // Add Length check
          if (Number(req.headers["content-length"]) !== data.length + 1) {
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
                  jsonrpc: "2.0",
                  error: {
                    code: -32000,
                    message: e.message,
                  },
                }),
              );
            });
        } catch {
          res.statusCode = 415;
          res.end(
            JSON.stringify({
              id: 1,
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: "Wrong content length",
              },
            }),
          );
        }
      });
    });

    // Passing 0 as port lets the net stack use a random free port
    const optsPort = parseInt(opts[0], 10);
    const port = optsPort || optsPort === 0 ? optsPort : 8080;

    this.server.listen(port);
  }

  down() {
    return new Promise<void>((resolve, reject) => {
      const ts = setTimeout(() => {
        reject();
      }, 10000);
      this.server && this.server.close(() => {
        clearTimeout(ts);
        resolve();
      });
    });
  }
}
