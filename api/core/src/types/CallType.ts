import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';

import { ContextType } from './ContextType';

export type CallType = {
  method: string;
  context: ContextType;
  parameters: ParamsType;
  result: ResultType;
};
