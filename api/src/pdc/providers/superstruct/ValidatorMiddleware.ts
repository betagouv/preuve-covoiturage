import {
  ContextType,
  InvalidParamsException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
  UnexpectedException,
} from "@/ilos/common/index.ts";
import { validate } from "@/lib/superstruct/index.ts";
import { NextFunction } from "dep:express";
import { Struct, StructError } from "dep:superstruct";

@middleware()
export class ValidatorMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: NextFunction,
    schema: Struct<unknown>,
  ): Promise<ResultType> {
    try {
      const [err, data] = validate(params, schema, { coerce: true });
      if (err) {
        throw err;
      }
      return next(data, context);
    } catch (e) {
      if (e instanceof StructError) {
        throw new InvalidParamsException(e.failures().map((f) => `${f.path} : ${f.message}`));
      }
      throw new UnexpectedException(`Validator has not been properly configured : ${JSON.stringify(schema)}`);
    }
  }
}
