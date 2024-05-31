import { RPCException } from './RPCException.ts';

export class TooManyRequestsException extends RPCException {
  constructor(data?: any) {
    super('Too Many Requests Error');
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32029,
      message: this.message,
    };
  }
}
