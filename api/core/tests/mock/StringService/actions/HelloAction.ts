import { Action } from '../../../../src//parents/Action';
import { ParamsType } from '../../../../src//types/ParamsType';
import { ContextType } from '../../../../src//types/ContextType';
import { ResultType } from '../../../../src//types/ResultType';
import { InvalidParamsException } from '../../../../src//exceptions/InvalidParamsException';
import { handler } from '../../../../src/container';

@handler({
  service: 'string',
  method: 'hello',
})
export class HelloAction extends Action {
  protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
    if (Array.isArray(params) || !('name' in params)) {
      throw new InvalidParamsException();
    }
    return `Hello world ${params.name}`;
  }
}
