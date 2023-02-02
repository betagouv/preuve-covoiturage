import { RPCErrorData } from '../types';
import { RPCException } from './RPCException';

export class ServiceException extends RPCException {
  public serviceError = true;

  constructor(data: RPCErrorData = undefined) {
    super(-32600, data);
  }
}
