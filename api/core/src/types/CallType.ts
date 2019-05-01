import { ResultType } from './ResultType';
import { ContextType } from './ContextType';
import { ParamsType } from './ParamsType';

export type CallType = {
  method: string,
  context: ContextType
  params: ParamsType;
  result?: ResultType;
};
