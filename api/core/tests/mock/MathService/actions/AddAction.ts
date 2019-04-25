import { Action } from '~/parents/Action';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { ParamsType } from '~/types/ParamsType';
import { ContextType } from '~/types/ContextType';
import { ResultType } from '~/types/ResultType';
import { InvalidParamsException } from '~/exceptions/InvalidParamsException';

export class AddAction extends Action {
    public readonly signature: string = 'add';

    protected middlewares: MiddlewareInterface[] = [];

    protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
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
