import { Action } from '../../../../src//parents/Action';
import { MiddlewareInterface } from '../../../../src//interfaces/MiddlewareInterface';
import { ParamsType } from '../../../../src//types/ParamsType';
import { ContextType } from '../../../../src//types/ContextType';
import { ResultType } from '../../../../src//types/ResultType';
import { InvalidParamsException } from '../../../../src//exceptions/InvalidParamsException';
import { handler } from '../../../../src//Container';

@handler({
  service: 'math',
  method: 'add',
})
export class AddAction extends Action {
  public readonly middlewares: MiddlewareInterface[] = [];

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    if (!Array.isArray(params)) {
      throw new InvalidParamsException();
    }
    let result = 0;
    params.forEach((add: number) => {
      result += add;
    });
    return result;
  }
}
