import {
  middleware,
  ValidatorInterfaceResolver,
  ParamsType,
  ContextType,
  ResultType,
  MiddlewareInterface,
  InvalidParamsException,
} from '@ilos/common';

@middleware()
export class ValidatorMiddleware implements MiddlewareInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async process(params: ParamsType, context: ContextType, next: Function, schema: string): Promise<ResultType> {
    try {
      await this.validator.validate(params, schema);
    } catch (e) {
      throw new InvalidParamsException(e.message);
    }

    return next(params, context);
  }
}
