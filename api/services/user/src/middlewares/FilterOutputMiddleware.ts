import { Types, Exceptions, Interfaces, Container } from '@pdc/core';

export type FilterOutputMiddlewareOptionsType = string[];

@Container.middleware()
export class FilterOutputMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    options: FilterOutputMiddlewareOptionsType,
  ): Promise<Types.ResultType> {
    console.log('options', options);
    const val = await next(params, context);

    console.log('test', val);
  }
}
