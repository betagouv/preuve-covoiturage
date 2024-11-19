import { Exception } from "./Exception.ts";

export class UnexpectedException extends Exception {
  constructor(data?: any) {
    super("Internal Server Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32603,
      message: this.message,
    };
    this.httpCode = 500;
  }
}
