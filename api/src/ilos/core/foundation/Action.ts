import {
  CallType,
  ContextType,
  HandlerInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";

/**
 * Action parent class, must be decorated
 * @export
 * @abstract
 * @class Action
 * @implements {HandlerInterface}
 */
export abstract class Action implements HandlerInterface {
  protected async handle(
    _params: ParamsType,
    _context: ContextType,
  ): Promise<ResultType> {
    throw new Error("No implementation found");
  }

  public async call(call: CallType): Promise<ResultType> {
    return this.handle(call.params, call.context);
  }
}
