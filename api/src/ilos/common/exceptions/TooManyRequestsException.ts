import { Exception } from "./Exception.ts";

export class TooManyRequestsException extends Exception {
  constructor(data?: any) {
    super("Too Many Requests Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32029,
      message: this.message,
    };
    this.httpCode = 429;
  }
}
