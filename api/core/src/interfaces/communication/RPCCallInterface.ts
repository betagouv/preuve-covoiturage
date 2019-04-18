import { ParamsType } from '../../types/ParamsType';

export interface RPCCallInterface {
  id?: string | number | null;
  jsonrpc: string;
  method: string;
  params?: ParamsType;
}
