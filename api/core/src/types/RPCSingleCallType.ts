import { ParamsType } from './ParamsType';

export type RPCSingleCallType = {
  id?: string | number | null;
  jsonrpc: string;
  method: string;
  params?: ParamsType;
};
