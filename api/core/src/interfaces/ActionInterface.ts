import { CallInterface } from './CallInterface';

export interface ActionInterface {
  signature: string;
  cast(call: CallInterface):void;
}

