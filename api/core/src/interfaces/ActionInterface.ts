import { CallInterface } from './communication/CallInterface';

export interface ActionInterface {
  signature: string;
  call(call: CallInterface):void;
}

