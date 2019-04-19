import { RPCErrorInterface } from '../interfaces/communication/RPCErrorInterface';

export class ServiceException extends Error {
  serviceError = true;
  rpcError: RPCErrorInterface;

  constructor(rpcError: RPCErrorInterface) {
    super(rpcError.message);
    this.rpcError = rpcError;
  }
}
