import { Types, Interfaces, Container } from '@ilos/core';
import * as _ from 'lodash';

export type FilterOutputMiddlewareOptionsType = {
  whiteList?: string[],
  blackList?: string[],
};


/*
 * Delete properties from model or array of models on output of handler
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
    let mappedResult = await _.get(result, 'data', result);

    if ('whiteList' in filterProperties && 'blackList' in filterProperties) {
      throw new Error();
    }

    if ('blackList' in filterProperties) {
      filterProperties.blackList.forEach((prop: string) => {
        if (mappedResult instanceof Array) {
          mappedResult.map((model: object) => delete model[prop]);
        } else if (prop in mappedResult) {
          delete result[prop];
        }
      });
    }

    if ('whiteList' in filterProperties) {
      if (mappedResult instanceof Array) {
        mappedResult = mappedResult.map((model: object) => _.pick(model, filterProperties.whiteList));
      } else if (mappedResult instanceof Object) {
        mappedResult = _.pick(mappedResult, filterProperties.whiteList);
      }
    }

    if ('data' in result) {
      result.data = mappedResult;
      return result;
    }

    return mappedResult;
  }
}
