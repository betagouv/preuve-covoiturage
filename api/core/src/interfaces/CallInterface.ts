import { ContextInterface } from './ContextInterface';

export interface CallInterface {
  method: string;
  context: ContextInterface;
  parameters: {[prop: string]: any};
  result: {[prop: string]: any};
}
