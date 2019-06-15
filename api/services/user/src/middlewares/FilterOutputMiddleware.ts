import { Types, Interfaces, Container } from '@ilos/core';

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
    let result = await next(params, context);

    if ('whiteList' in filterProperties && 'blackList' in filterProperties) {
      throw new Error();
    }

    if ('blackList' in filterProperties) {
      filterProperties.blackList.forEach((prop: string) => {
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
    }

    if ('whiteList' in filterProperties) {
      const filteredResult = {};
      filterProperties.whiteList.forEach((prop: string) => {
        if (result instanceof Array) {
          result.forEach((model: object) => {
            if (prop in model) {
              filteredResult[prop] = model[prop];
            }
          });
        } else if (prop in result) {
          filteredResult[prop] = result[prop];
        }
      });
      result = filteredResult;
    }
    return this.clean(result);
  }

  private clean(result: any) {
    if (result instanceof Array) {
      result.forEach((model: object) => {
        for (const key in Object.keys(model)) {
          if (model[key] === undefined || model[key] === null) {
            delete model[key];
          }
        }
      });
    } else if (result instanceof Object) {
      for (const key in result) {
        if (result[key] === undefined || result[key] === null) {
          delete result[key];
        }
      }
    }

    return result;
  }
}
