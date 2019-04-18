import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';

import { ContextInterface } from './ContextInterface';

export interface CallInterface {
  method: string;
  context: ContextInterface;
  parameters: ParamsType;
  result: ResultType;
}
