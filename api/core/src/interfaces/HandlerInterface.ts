import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';
import { MiddlewareInterface } from './MiddlewareInterface';

export interface HandlerInterface {
  call(call: CallType):Promise<ResultType>;
}
