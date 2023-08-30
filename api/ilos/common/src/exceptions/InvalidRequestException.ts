import { RPCException } from './RPCException';

export class InvalidRequestException extends RPCException {
  constructor(data?: any) {
    super('Invalid Request');
    this.rpcError = {
      data,
      nolog: true,
      code: -32600,
      message: this.message,
    };
  }
}
