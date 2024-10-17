import { RPCException } from "./RPCException.ts";

export class UnprocessableEntityException extends RPCException {
  constructor(data?: any) {
    super("Unprocessable Entity");
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32622,
      message: this.message,
    };
  }
}
