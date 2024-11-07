import { Exception } from "./Exception.ts";

export class InvalidRequestException extends Exception {
  constructor(data?: any) {
    super("Invalid Request");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32600,
      message: this.message,
    };
    this.httpCode = 400;
  }
}
