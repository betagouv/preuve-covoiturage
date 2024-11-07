import { Exception } from "./Exception.ts";

export class InvalidParamsException extends Exception {
  constructor(data?: any) {
    super("Invalid params");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32602,
      message: this.message,
    };
    this.httpCode = 400;
  }
}
