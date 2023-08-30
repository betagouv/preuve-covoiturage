import { RPCException } from './RPCException';

export class MethodNotFoundException extends RPCException {
  constructor(data?: any) {
    super('Method not found');
    this.rpcError = {
      data,
      nolog: true,
      code: -32601,
      message: this.message,
    };
  }
}
