import { ResultType } from './ResultType';
import { RPCErrorType } from './RPCErrorType';
import { IdType } from './IdType';

export type RPCSingleResponseType = {
  id: IdType;
  jsonrpc: string;
  result?: ResultType;
  error?: RPCErrorType;
};
