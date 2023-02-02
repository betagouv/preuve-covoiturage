import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class TooManyRequestsException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32029, data);
  }
}
