import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class UnauthorizedException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32501, data);
  }
}
