import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class MethodNotFoundException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32601, data);
  }
}
