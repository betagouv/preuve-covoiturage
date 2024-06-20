import { RPCException } from "./RPCException.ts";

export class ForbiddenException extends RPCException {
  constructor(data?: any) {
    super("Forbidden Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32503,
      message: this.message,
    };
  }
}
