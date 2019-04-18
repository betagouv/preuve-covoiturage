import { ContextInterface } from '~/interfaces/communication/ContextInterface';
import { ParamsType } from '~/types/ParamsType';
import { ResultType } from '~/types/ResultType';

import { ActionInterface } from '../interfaces/ActionInterface';
import { ActionConstructorInterface } from '../interfaces/ActionConstructorInterface';
import { CallInterface } from '../interfaces/communication/CallInterface';
import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';

export abstract class Provider {
  public readonly signature: string;
  public readonly version: string;

  protected actions: ActionConstructorInterface[] = [];
  protected middlewares: MiddlewareInterface[] = [];

  private actionInstances: Map<string, ActionInterface> = new Map();

  public boot() {
    this.actions.forEach((action) => {
      const actionInstance = new action();
      this.actionInstances.set(actionInstance.signature, actionInstance);
    });
  }

  public resolve(call: CallInterface): CallInterface {
    if (!this.actionInstances.has(call.method)) {
      throw new Error('Unkmown method');
    }
    this.actionInstances.get(call.method).call(call);
    return call;
  }

  public async call(method: string, parameters: ParamsType, context: ContextInterface = { internal: true }): Promise<ResultType> {
    const result = {};
    this.resolve({
      method,
      parameters,
      result,
      context,
    });
    return result;
  }
}
