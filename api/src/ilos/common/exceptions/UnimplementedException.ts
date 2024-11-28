import { Exception } from "./Exception.ts";

export class UnimplementedException extends Exception {
  constructor(data?: any) {
    super("Unimplemented Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32503,
      message: this.message,
    };
    this.httpCode = 501;
  }
}
