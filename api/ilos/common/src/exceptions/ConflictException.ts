import { RPCException } from './RPCException';

export class ConflictException extends RPCException {
  constructor(data?: any) {
    super('Conflict');
    this.rpcError = {
      data,
      nolog: true,
      code: -32509,
      message: this.message,
    };
  }
}
