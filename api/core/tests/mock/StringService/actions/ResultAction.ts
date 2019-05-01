import { Action } from '~/parents/Action';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { ParamsType } from '~/types/ParamsType';
import { ContextType } from '~/types/ContextType';
import { ResultType } from '~/types/ResultType';
import { InvalidParamsException } from '~/exceptions/InvalidParamsException';
import { RPCSingleResponseType } from '~/types/RPCSingleResponseType';
import { handler } from '~/Container';
import { Kernel } from '~/parents/Kernel';

@handler({
  service: 'string',
  method: 'result',
})
export class ResultAction extends Action {
  public readonly middlewares: MiddlewareInterface[] = [];

  constructor(private kernel: Kernel) {
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
