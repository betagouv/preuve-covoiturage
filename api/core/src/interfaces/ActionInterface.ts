import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';

export interface ActionInterface {
  signature: string;

  call(call: CallType):Promise<ResultType>;
}

