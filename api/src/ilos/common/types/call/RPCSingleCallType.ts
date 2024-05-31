import { ParamsWithContextType } from './ParamsWithContextType.ts';
import { ParamsType } from './ParamsType.ts';
import { IdType } from './IdType.ts';

export type RPCSingleCallType = {
  id?: IdType;
  jsonrpc: string;
  method: string;
  params?: ParamsType | ParamsWithContextType;
};
