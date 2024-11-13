import { Exception } from "./Exception.ts";

export class ConflictException extends Exception {
  constructor(data?: any) {
    super("Conflict");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32509,
      message: this.message,
    };
    this.httpCode = 409;
  }
}
