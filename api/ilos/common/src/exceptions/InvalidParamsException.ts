import { RPCException } from './RPCException';

export class InvalidParamsException extends RPCException {
  constructor(data?: any) {
    super('Invalid params');
    this.rpcError = {
      data,
      nolog: true,
      code: -32602,
      message: this.message,
    };
  }
}
