import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class ServiceDisabledException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32601, data);
  }
}
