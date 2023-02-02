import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class ForbiddenException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32503, data);
  }
}
