import { RPCException } from './RPCException';

export class NotFoundException extends RPCException {
  constructor(data?: any) {
    super('Not found');
    this.rpcError = {
      data,
      code: -32504,
      message: this.message,
    };
  }
}
