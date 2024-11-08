import { Exception } from "./Exception.ts";

export class UnprocessableRequestException extends Exception {
  constructor(data?: any) {
    super("Unprocessable Request");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32600,
      message: this.message,
    };
    this.httpCode = 422;
  }
}
