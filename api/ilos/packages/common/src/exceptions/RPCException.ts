import { RPCErrorType } from '../types/call/RPCErrorType';

export abstract class RPCException extends Error {
  rpcError: RPCErrorType;
}
