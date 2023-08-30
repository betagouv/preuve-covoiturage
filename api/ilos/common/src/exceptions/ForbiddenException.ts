import { RPCException } from './RPCException';

export class ForbiddenException extends RPCException {
  constructor(data?: any) {
    super('Forbidden Error');
    this.rpcError = {
      data,
      nolog: true,
      code: -32503,
      message: this.message,
    };
  }
}
