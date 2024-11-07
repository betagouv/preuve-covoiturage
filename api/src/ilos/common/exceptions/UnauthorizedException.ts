import { Exception } from "./Exception.ts";

export class UnauthorizedException extends Exception {
  constructor(data?: any) {
    super("Unauthorized Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32501,
      message: this.message,
    };
    this.httpCode = 401;
  }
}
