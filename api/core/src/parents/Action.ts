import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallType } from '../types/CallType';
import { ActionInterface } from '../interfaces/ActionInterface';
import { callStack } from '../helpers/callStack';

export abstract class Action implements ActionInterface {
  public readonly signature: string;

  protected middlewares: MiddlewareInterface[] = [];

  protected handle(call: CallType):void {
    throw new Error('No implementation found');
  }

  public call(call: CallType):void {
    callStack(call, ...this.middlewares, this.handle);
  }
}
