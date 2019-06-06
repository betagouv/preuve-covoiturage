import { Interfaces, Container, Types, Exceptions } from '@pdc/core';

import { ValidatorProviderInterfaceResolver } from './ValidatorProviderInterface';

@Container.middleware()
export class ValidatorMiddleware implements Interfaces.MiddlewareInterface {
  constructor(private validator: ValidatorProviderInterfaceResolver) {}

  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    schema: string,
  ): Promise<Types.ResultType> {
    try {
      await this.validator.validate(params, schema);
    } catch (e) {
      throw new Exceptions.InvalidParamsException(e.message);
    }

    return next(params, context);
  }
}
