import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class ParseErrorException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32700, data);
  }
}
