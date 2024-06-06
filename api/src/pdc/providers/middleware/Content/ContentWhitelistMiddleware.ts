import { _ } from '@/deps.ts';

import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@/ilos/common/index.ts';
import { ConfiguredMiddleware } from '../interfaces.ts';

/*
 * Delete properties from model or array of models on output of handler
 */
@middleware()
export class ContentWhitelistMiddleware implements MiddlewareInterface<ContentWhitelistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    config: ContentWhitelistMiddlewareParams,
  ): Promise<ResultType> {
    const result = await next(params, context);
    const isArray = Array.isArray(result);
    let data = result;

    if (!isArray) {
      data = [data];
    }

    const configKeys = config
      .map((k: string) => k.split('.'))
      .reduce((acc: object, keys: string[]) => {
        _.set(acc, keys, true);
        return acc;
      }, {});

    data = this.whitelist(data, configKeys);

    return isArray ? data : data[0];
  }

  protected whitelist(model: any[] | any, keys: object): any[] | any {
    if (Array.isArray(model)) {
      return model.map((m) => this.whitelist(m, keys));
    }

    let result = {};
    Reflect.ownKeys(keys).map((key: string) => {
      const keyValue = keys[key];
      if (keyValue === true) {
        if (key === '*') {
          result = model;
        } else {
          result[key] = model[key];
        }
      } else if (key === '*') {
        result = this.whitelist(model, keyValue);
      } else if (key in model) {
        result[key] = this.whitelist(model[key], keyValue);
      }
    });
    return result;
  }
}

export type ContentWhitelistMiddlewareParams = string[];

const alias = 'content.only';

export const contentWhitelistMiddlewareBinding = [alias, ContentWhitelistMiddleware];

export function contentWhitelistMiddleware(
  ...params: ContentWhitelistMiddlewareParams
): ConfiguredMiddleware<ContentWhitelistMiddlewareParams> {
  return [alias, params];
}
