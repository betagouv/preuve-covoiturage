import {
  ContextType,
  MiddlewareInterface,
  ParamsType,
  ResultType,
  ValidatorInterfaceResolver,
  middleware,
} from '/ilos/common/index.ts';

@middleware()
export class ValidatorMiddleware implements MiddlewareInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async process(params: ParamsType, context: ContextType, next: Function, schema: string): Promise<ResultType> {
    await this.validator.validate(params, schema);
    return next(params, context);
  }
}
