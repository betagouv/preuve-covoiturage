import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';

import { ContextType } from '../types/ContextType';

export interface ProviderInterface {
  readonly signature: string;
  readonly version: string;
  boot():void;
  call(method: string, parameters: ParamsType, context: ContextType): Promise<ResultType>;
}
