import { RPCException } from './RPCException';

export class MethodNotFoundException extends RPCException {
  constructor(data?: any) {
    super('Method not found');
    this.rpcError = {
      data,
      code: -32601,
      message: this.message,
    };
  }
}
