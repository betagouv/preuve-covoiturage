import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallInterface } from '../interfaces/communication/CallInterface';
import { ActionInterface } from '../interfaces/ActionInterface';
import { callStack } from '../helpers/callStack';

export abstract class Action implements ActionInterface {
  public readonly signature: string;

  protected middlewares: MiddlewareInterface[] = [];

  protected handle(call: CallInterface):void {
    throw new Error('No implementation found');
  }

  public call(call: CallInterface):void {
    callStack(call, ...this.middlewares, this.handle);
  }
}
