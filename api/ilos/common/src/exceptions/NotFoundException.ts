import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class NotFoundException extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(-32504, data);
  }
}
