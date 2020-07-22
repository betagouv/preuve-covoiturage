import { Action } from '@ilos/core';
import {
  handler,
  ParamsType,
  ContextType,
  ResultType,
  RPCSingleResponseType,
  KernelInterfaceResolver,
  InvalidParamsException,
} from '@ilos/common';

import { CustomProvider } from '../../Providers/CustomProvider';

@handler({
  service: 'string',
  method: 'result',
})
export class ResultAction extends Action {
  constructor(private kernel: KernelInterfaceResolver, public custom: CustomProvider) {
    super();
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    if (Array.isArray(params) || !('name' in params) || !('add' in params) || !Array.isArray(params.add)) {
      throw new InvalidParamsException();
    }
    const addResult = await (this.kernel.handle({
      jsonrpc: '2.0',
      method: 'math:add',
      id: 1,
      params: params.add,
    }) as Promise<RPCSingleResponseType>);
    if (addResult && 'result' in addResult) {
      return `${this.custom.get()}Hello world ${params.name}, result is ${addResult.result}`;
    }
    throw new Error('Something goes wrong');
  }
}
