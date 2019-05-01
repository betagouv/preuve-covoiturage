import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { HandlerInterface } from '../interfaces/HandlerInterface';
import { compose } from '../helpers/compose';

export abstract class Action implements HandlerInterface {
  public readonly signature: string;
  public readonly middlewares: MiddlewareInterface[] = [];

  protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
    throw new Error('No implementation found');
  }

  public async call(call: CallType):Promise<ResultType> {
    const composer = compose([...this.middlewares, async (cl:CallType) => {
      const result = await this.handle(cl.params, cl.context);
      cl.result = result;
    }]);
    await composer(call);
    return call.result;
  }
}
