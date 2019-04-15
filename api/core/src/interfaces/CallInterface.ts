import { ContextInterface } from './ContextInterface';

export interface CallInterface {
  context: ContextInterface;
  parameters: {[prop: string]: any};
  result: {[prop: string]: any};
}
