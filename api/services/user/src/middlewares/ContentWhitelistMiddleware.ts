import { Types, Interfaces, Container } from '@ilos/core';
import set from 'lodash/set';

/*
 * Delete properties from model or array of models on output of handler
 */
@Container.middleware()
export class ContentWhitelistMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    config: string[],
  ): Promise<Types.ResultType> {
    const result = await next(params, context);
    const isArray = Array.isArray(result);
    let data = result;

    if (!isArray) {
      data = [data];
    }

    const configKeys = config
      .map((k:string) => k.split('.'))
      .reduce(
        (acc:object, keys:string[]) => {
          set(acc, keys, true);
          return acc;
        },
        {},
      );

    data = this.whitelist(data, configKeys);

    return isArray ? data : data[0];
  }

  protected whitelist(model:any[], keys: object): any[] | any {
    if (Array.isArray(model)) {
      return model.map((m) => this.whitelist(m, keys));
    }

    let result = {};
    Reflect.ownKeys(keys).map((key:string) => {
      const keyValue = keys[key];
      if (keyValue === true) {
        result[key] = model[key];
      } else if (key === '*') {
          result = this.whitelist(model, keyValue);
      } else {
        result[key] = this.whitelist(model[key], keyValue);
      }
    });
    return result;
  }
}
