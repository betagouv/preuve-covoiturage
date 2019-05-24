import { Action } from '../../../../src//parents/Action';
import { ParamsType } from '../../../../src//types/ParamsType';
import { ContextType } from '../../../../src//types/ContextType';
import { ResultType } from '../../../../src//types/ResultType';
import { InvalidParamsException } from '../../../../src//exceptions/InvalidParamsException';
import { RPCSingleResponseType } from '../../../../src/types/RPCSingleResponseType';
import { handler } from '../../../../src/container';
import { KernelInterfaceResolver } from '../../../../src/interfaces/KernelInterface';

@handler({
  service: 'string',
  method: 'result',
})
export class ResultAction extends Action {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    if (Array.isArray(params) || !('name' in params) || !('add' in params) || (!Array.isArray(params.add))) {
      throw new InvalidParamsException();
    }
    const addResult = await <Promise<RPCSingleResponseType>>this.kernel.handle({
      jsonrpc: '2.0',
      method: 'math:add',
      id: 1,
      params: params.add,
    });
    if (addResult && 'result' in addResult) {
      return `Hello world ${params.name}, result is ${addResult.result}`;
    }
    throw new Error('Something goes wrong');
  }
}
