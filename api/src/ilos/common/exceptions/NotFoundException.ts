import { Exception } from "./Exception.ts";

export class NotFoundException extends Exception {
  constructor(data?: any) {
    super("Not found");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32504,
      message: this.message,
    };
    this.httpCode = 404;
  }
}
