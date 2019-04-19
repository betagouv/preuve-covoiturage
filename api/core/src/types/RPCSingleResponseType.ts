import { ResultType } from '~/types/ResultType';

import { RPCErrorType } from './RPCErrorType';

export type RPCSingleResponseType = {
  id: string | number | null;
  jsonrpc: string;
  result?: ResultType;
  error?: RPCErrorType;
};
