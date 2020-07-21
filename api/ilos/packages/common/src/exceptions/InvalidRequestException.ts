import { RPCException } from './RPCException';

export class InvalidRequestException extends RPCException {
  constructor(data?: any) {
    super('Invalid Request');
    this.rpcError = {
      data,
      code: -32600,
      message: this.message,
    };
  }
}
