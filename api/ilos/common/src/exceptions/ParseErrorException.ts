import { RPCException } from './RPCException';

export class ParseErrorException extends RPCException {
  constructor(data?: any) {
    super('Parse error');
    this.rpcError = {
      data,
      nolog: true,
      code: -32700,
      message: this.message,
    };
  }
}
