import { RPCException } from "./RPCException.ts";

export class ConflictException extends RPCException {
  constructor(data?: any) {
    super("Conflict");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32509,
      message: this.message,
    };
  }
}
