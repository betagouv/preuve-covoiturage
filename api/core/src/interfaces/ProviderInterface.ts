import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';

import { ContextInterface } from './communication/ContextInterface';

export interface ProviderInterface {
  readonly signature: string;
  readonly version: string;
  boot():void;
  call(method: string, parameters: ParamsType, context: ContextInterface): Promise<ResultType>;
}
