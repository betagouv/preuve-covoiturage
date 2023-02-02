import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class InvalidParamsException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32602, data);
  }
}
