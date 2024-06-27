import { NextFunction } from "@/deps.ts";
import {
  ContextType,
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
    next: NextFunction,
    schema: string,
  ): Promise<ResultType> {
    await this.validator.validate(params, schema);
    return next(params, context);
  }
}
