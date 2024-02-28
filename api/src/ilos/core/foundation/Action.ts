import { CallType, ResultType, ParamsType, ContextType, HandlerInterface } from '@ilos/common';

/**
 * Action parent class, must be decorated
 * @export
 * @abstract
 * @class Action
 * @implements {HandlerInterface}
 */
export abstract class Action implements HandlerInterface {
  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    throw new Error('No implementation found');
  }

  public async call(call: CallType): Promise<ResultType> {
    return this.handle(call.params, call.context);
  }
}
