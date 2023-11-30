import { RPCException } from './RPCException';

export class TimeoutException extends RPCException {
  constructor(data?: any) {
    super('Timeout');
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32408,
      message: this.message,
    };
  }
}
