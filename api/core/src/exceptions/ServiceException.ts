import { RPCErrorType } from '../types/RPCErrorType';

export class ServiceException extends Error {
  serviceError = true;
  rpcError: RPCErrorType;

  constructor(rpcError: RPCErrorType) {
    super(rpcError.message);
    this.rpcError = rpcError;
  }
}
