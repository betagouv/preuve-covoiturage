import { RPCException } from "./RPCException.ts";

export class UnimplementedException extends RPCException {
  constructor(data?: any) {
    super("Unimplemented Error");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32503,
      message: this.message,
    };
  }
}
