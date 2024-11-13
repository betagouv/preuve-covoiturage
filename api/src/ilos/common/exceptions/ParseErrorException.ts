import { Exception } from "./Exception.ts";

export class ParseErrorException extends Exception {
  constructor(data?: any) {
    super("Parse error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32700,
      message: this.message,
    };
    this.httpCode = 422;
  }
}
