import {
  ContextType,
  FunctionMiddlewareInterface,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
  ValidatorInterfaceResolver,
} from "@/ilos/common/index.ts";

@middleware()
export class ValidatorMiddleware implements MiddlewareInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async process(
    params: ParamsType,
    context: ContextType,
    next: FunctionMiddlewareInterface,
    schema: string,
  ): Promise<ResultType> {
    await this.validator.validate(params, schema);
    return next(params, context);
  }
}
