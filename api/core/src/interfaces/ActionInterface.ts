import { CallType } from '../types/CallType';

export interface ActionInterface {
  signature: string;
  call(call: CallType):void;
}

