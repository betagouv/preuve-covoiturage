import { RPCErrorType } from '../types/RPCErrorType';

export abstract class RPCException extends Error {
  rpcError: RPCErrorType;
}
