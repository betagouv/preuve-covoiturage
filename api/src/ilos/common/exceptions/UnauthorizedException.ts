import { RPCException } from './RPCException.ts';

export class UnauthorizedException extends RPCException {
  constructor(data?: any) {
    super('Unauthorized Error');
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32501,
      message: this.message,
    };
  }
}
