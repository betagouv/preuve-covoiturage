import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class TimeoutException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32408, data);
  }
}
