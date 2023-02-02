import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class ConflictException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32509, data);
  }
}
