import { ParamsType } from '../types/ParamsType';
import { ResultType } from '../types/ResultType';
import { ContextType } from '../types/ContextType';

import { ProviderInterface } from './ProviderInterface';

export interface ServiceProviderInterface extends ProviderInterface {
  readonly version: string;
  call(method: string, parameters: ParamsType, context: ContextType): Promise<ResultType>;
}
