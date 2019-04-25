import { Action } from '~/parents/Action';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { ParamsType } from '~/types/ParamsType';
import { ContextType } from '~/types/ContextType';
import { ResultType } from '~/types/ResultType';
import { InvalidParamsException } from '~/Exceptions/InvalidParamsException';
import { RPCSingleResponseType } from '~/types/RPCSingleResponseType';

export class ResultAction extends Action {
    public readonly signature: string = 'result';

    protected middlewares: MiddlewareInterface[] = [];

    protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
      if (Array.isArray(params) || !('name' in params) || !('add' in params) || (!Array.isArray(params.add))) {
        throw new InvalidParamsException();
      }
      const addResult = await <Promise<RPCSingleResponseType>>this.kernel.handle({
        jsonrpc: '2.0',
        method: 'math:add',
        id: 1,
        params: params.add,
      });
      return `Hello world ${params.name}, result is ${addResult.result}`;
    }
 
}