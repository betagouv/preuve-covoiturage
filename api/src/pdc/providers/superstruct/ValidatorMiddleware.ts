import { NextFunction, superstruct } from "@/deps.ts";
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

@middleware()
export class ValidatorMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: NextFunction,
    schema: superstruct.Struct<unknown>,
  ): Promise<ResultType> {
    try {
      const [err, data] = validate(params, schema, { coerce: true });
      if (err) {
        throw err;
      }
      return next(data, context);
    } catch (e) {
      if (e instanceof superstruct.StructError) {
        throw new InvalidParamsException(e.failures().map((f) => `${f.path} : ${f.message}`));
      }
      throw new UnexpectedException(`Validator has not been properly configured : ${JSON.stringify(schema)}`);
    }
    return next(params, context);
  }
}
