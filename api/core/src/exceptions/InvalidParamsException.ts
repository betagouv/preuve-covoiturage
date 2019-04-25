import { RPCException } from './RPCException';

export class InvalidParamsException extends RPCException {
  constructor(data?: any) {
    super('Invalid params');
    this.rpcError = {
      data,
      code: -32602,
      message: this.message,
    };
  }
}
