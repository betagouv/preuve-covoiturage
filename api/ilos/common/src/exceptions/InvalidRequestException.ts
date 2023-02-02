import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class InvalidRequestException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32600, data);
  }
}
