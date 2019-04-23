import { KernelInterface } from '~/interfaces/KernelInterface';

import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { ActionInterface } from '../interfaces/ActionInterface';
import { compose } from '../helpers/compose';

export abstract class Action implements ActionInterface {
  public readonly signature: string;

  protected middlewares: MiddlewareInterface[] = [];
  protected kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

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
