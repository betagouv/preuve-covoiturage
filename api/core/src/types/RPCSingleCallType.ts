import { ParamsWithContextType } from './ParamsWithContextType';
import { ParamsType } from './ParamsType';
import { IdType } from './IdType';

export type RPCSingleCallType = {
  id?: IdType;
  jsonrpc: string;
  method: string;
  params?: ParamsType | ParamsWithContextType;
};
