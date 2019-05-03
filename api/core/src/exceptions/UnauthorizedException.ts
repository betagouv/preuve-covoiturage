import { RPCException } from './RPCException';

export class UnauthorizedException extends RPCException {
  constructor(data?: any) {
    super('Unauthorized Error');
    this.rpcError = {
      data,
      code: -32501,
      message: this.message,
    };
  }
}
