import { Types, Exceptions, Interfaces, Container } from '@pdc/core';

export type FilterOutputMiddlewareOptionsType = string[];

@Container.middleware()
export class FilterOutputMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    filterProperties: FilterOutputMiddlewareOptionsType,
  ): Promise<Types.ResultType> {
    const result = await next(params, context);

    filterProperties.forEach((prop) => {
      if (prop in result) {
        delete result[prop];
      }
    });

    return result;
  }
}
