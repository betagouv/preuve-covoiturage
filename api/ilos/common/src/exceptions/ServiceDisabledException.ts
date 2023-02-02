import { RPCException } from '@ilos/common';
import { RPCErrorData } from '../types';

export class ServiceDisabledException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32601, data);
  }
}
