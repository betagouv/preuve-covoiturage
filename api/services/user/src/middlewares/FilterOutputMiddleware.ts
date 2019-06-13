import { Types, Interfaces, Container } from '@ilos/core';

export type FilterOutputMiddlewareOptionsType = string[];


/*
 * Delete property from model or array of models on output of handler
 */
@Container.middleware()
export class FilterOutputMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    filterProperties: FilterOutputMiddlewareOptionsType,
  ): Promise<Types.ResultType> {
    const result = await next(params, context);
    filterProperties.forEach((prop: string) => {
      if (result instanceof Array) {
        result.forEach((model: object) => {
          if (prop in model) {
            delete model[prop];
          }
        });
      } else if (prop in result) {
        delete result[prop];
      }
    });

    return result;
  }
}
