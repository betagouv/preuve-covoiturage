import { ContextType } from '../types/ContextType';
import { ResultType } from '../types/ResultType';
import { CallType } from '../types/CallType';
import { ParamsType } from '../types/ParamsType';

import { ActionInterface } from '../interfaces/ActionInterface';
import { ActionConstructorInterface } from '../interfaces/ActionConstructorInterface';
import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { KernelInterface } from '../interfaces/KernelInterface';

import { compose } from '../helpers/compose';

export abstract class Provider implements ServiceProviderInterface {
  public readonly signature: string;
  public readonly version: string;

  protected kernel: KernelInterface;
  protected actions: ActionConstructorInterface[] = [];
  protected middlewares: MiddlewareInterface[] = [];

  protected actionInstances: Map<string, ActionInterface> = new Map();

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  public boot() {
    this.actions.forEach((action) => {
      const actionInstance = new action(this.kernel);
      this.actionInstances.set(actionInstance.signature, actionInstance);
    });
  }

  protected async resolve(call: CallType): Promise<ResultType> {
    if (!this.actionInstances.has(call.method)) {
      throw new Error('Unkmown method');
    }
    const composer = compose([...this.middlewares, async (call:CallType) => {
      const result = await this.actionInstances.get(call.method).call(call);
      call.result = result;
    }]);
    await composer(call);
    return call.result;
  }

  public async call(method: string, params: ParamsType, context: ContextType = { internal: true }): Promise<ResultType> {
    const call = {
      method,
      params,
      context,
      result: null,
    };
    return this.resolve(call);
  }
}
