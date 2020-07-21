import { ResultType } from './ResultType';
import { ContextType } from './ContextType';
import { ParamsType } from './ParamsType';

export type CallType<P = ParamsType, C = ContextType, R = ResultType> = {
  method: string;
  context: C;
  params: P;
  result?: R;
};
