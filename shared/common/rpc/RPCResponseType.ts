import { ResultType, RPCErrorType } from '@ilos/common';

export interface RPCResponseType {
  id: number;
  jsonrpc: string;
  result?: ResultType;
  error?: RPCErrorType;
}
