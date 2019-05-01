import { Action } from '~/parents/Action';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { ParamsType } from '~/types/ParamsType';
import { ContextType } from '~/types/ContextType';
import { ResultType } from '~/types/ResultType';
import { InvalidParamsException } from '~/exceptions/InvalidParamsException';
import { handler } from '~/Container';

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
