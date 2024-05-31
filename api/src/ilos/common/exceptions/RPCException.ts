import { RPCErrorType } from '../types/call/RPCErrorType.ts';

export abstract class RPCException extends Error {
  rpcError: RPCErrorType;
  nolog?: boolean;
}
