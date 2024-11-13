import { Exception } from "./Exception.ts";

export class ForbiddenException extends Exception {
  constructor(data?: any) {
    super("Forbidden Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32503,
      message: this.message,
    };
    this.httpCode = 403;
  }
}
