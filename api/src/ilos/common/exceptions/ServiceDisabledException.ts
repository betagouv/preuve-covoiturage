import { Exception } from "@/ilos/common/index.ts";

export class ServiceDisabledException extends Exception {
  constructor() {
    super("This service is disabled");
    this.rpcError = {
      data: {},
      code: -32601,
      message: this.message,
    };
    this.httpCode = 405;
  }
}
