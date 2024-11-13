import { Exception } from "./Exception.ts";

export class MethodNotFoundException extends Exception {
  constructor(data?: any) {
    super("Method not found");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32601,
      message: this.message,
    };
    this.httpCode = 405;
  }
}
