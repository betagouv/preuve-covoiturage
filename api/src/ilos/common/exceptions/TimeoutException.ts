import { Exception } from "./Exception.ts";

export class TimeoutException extends Exception {
  constructor(data?: any) {
    super("Timeout");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32408,
      message: this.message,
    };
    this.httpCode = 408;
  }
}
