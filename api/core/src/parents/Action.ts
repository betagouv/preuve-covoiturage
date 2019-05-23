import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { HandlerInterface } from '../interfaces/HandlerInterface';
import { compose } from '../helpers/compose';
import { ContainerInterface } from '../container';
import { FunctionMiddlewareInterface, ClassMiddlewareInterface } from '../interfaces/ClassMiddlewareInterface';


/**
 * Action parent class, must be decorated
 * @export
 * @abstract
 * @class Action
 * @implements {HandlerInterface}
 */
export abstract class Action implements HandlerInterface {
  private wrapper: FunctionMiddlewareInterface = async (params, context, handle) => handle(params, context);
  public readonly middlewares: (string|[string, any])[] = [];

  async boot(container: ContainerInterface) {
    const middlewares = <(ClassMiddlewareInterface | [ClassMiddlewareInterface, any])[]>this.middlewares.map((value) => {
      if (typeof value === 'string') {
        return <ClassMiddlewareInterface>container.get(value);
      }
      const [key, config] = value;
      const middleware = <ClassMiddlewareInterface>container.get(key);
      return [middleware, config];
    });
    this.wrapper = compose(middlewares);
  }

  protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
    throw new Error('No implementation found');
  }

  public async call(call: CallType):Promise<ResultType> {
    return this.wrapper(call.params, call.context, async (params: ParamsType, context: ContextType) => this.handle(params, context));
  }
}
