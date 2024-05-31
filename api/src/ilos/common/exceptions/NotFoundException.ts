import { RPCException } from './RPCException.ts';

export class NotFoundException extends RPCException {
  constructor(data?: any) {
    super('Not found');
    this.nolog = true;
    this.rpcError = {
      data,
      code: -32504,
      message: this.message,
    };
  }
}
