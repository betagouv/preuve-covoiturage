import { set } from 'lodash';
import { Types, Interfaces, Container } from '@ilos/core';

/*
 * Delete properties from model or array of models on output of handler
 */
@Container.middleware()
export class ContentBlacklistMiddleware implements Interfaces.MiddlewareInterface {
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
      .map((k: string) => k.split('.'))
      .reduce((acc: object, keys: string[]) => {
        set(acc, keys, true);
        return acc;
      }, {});

    data = this.blacklist(data, configKeys);

    return isArray ? data : data[0];
  }

  protected blacklist(model: any[] | any, keys: object): any[] | any {
    if (Array.isArray(model)) {
      return model.map((m) => this.blacklist(m, keys));
    }

    const result = {};
    Reflect.ownKeys(model).map((key: string) => {
      const keyValue = keys[key];
      if (!keyValue) {
        result[key] = model[key];
      } else if (typeof keyValue === 'object' && '*' in keyValue) {
        result[key] = this.blacklist(model[key], keyValue['*']);
      }
    });
    return result;
  }
}
