import {
  ContextType,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
  ValidatorInterfaceResolver,
} from "@/ilos/common/index.ts";
import { NextFunction } from "dep:express";

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
