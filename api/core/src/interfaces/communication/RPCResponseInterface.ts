import { ResultType } from '~/types/ResultType';

import { RPCErrorInterface } from './RPCErrorInterface';

export interface RPCResponseInterface {
  id: string | number | null;
  jsonrpc: string;
  result?: ResultType;
  error?: RPCErrorInterface;
}
