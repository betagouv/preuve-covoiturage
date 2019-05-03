import { Action } from '../../../../src//parents/Action';
import { MiddlewareInterface } from '../../../../src//interfaces/MiddlewareInterface';
import { ParamsType } from '../../../../src//types/ParamsType';
import { ContextType } from '../../../../src//types/ContextType';
import { ResultType } from '../../../../src//types/ResultType';
import { InvalidParamsException } from '../../../../src//exceptions/InvalidParamsException';
import { handler } from '../../../../src//Container';

@handler({
  service: 'string',
  method: 'hello',
})
export class HelloAction extends Action {
  public readonly middlewares: MiddlewareInterface[] = [];

  protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
    if (Array.isArray(params) || !('name' in params)) {
      throw new InvalidParamsException();
    }
    return `Hello world ${params.name}`;
  }
}
