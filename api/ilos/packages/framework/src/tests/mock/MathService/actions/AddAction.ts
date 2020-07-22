import { Action } from '@ilos/core';
import { handler, ParamsType, ContextType, ResultType, InvalidParamsException } from '@ilos/common';

import { CustomProvider } from '../../Providers/CustomProvider';

@handler({
  service: 'math',
  method: 'add',
})
export class AddAction extends Action {
  constructor(public custom: CustomProvider) {
    super();
  }

  protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
    if (!Array.isArray(params)) {
      throw new InvalidParamsException();
    }
    let result = 0;
    params.forEach((add: number) => {
      result += add;
    });
    return `${this.custom.get()}${result}`;
  }
}
