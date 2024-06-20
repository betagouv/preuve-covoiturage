import { _ } from "@/deps.ts";

import {
  ContextType,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { ConfiguredMiddleware } from "../interfaces.ts";

/*
 * Delete properties from model or array of models on output of handler
 */
@middleware()
export class ContentBlacklistMiddleware
  implements MiddlewareInterface<ContentBlacklistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    config: ContentBlacklistMiddlewareParams,
  ): Promise<ResultType> {
    const result = await next(params, context);
    const isArray = Array.isArray(result);
    let data = result;

    if (!isArray) {
      data = [data];
    }

    const configKeys = config
      .map((k: string) => k.split("."))
      .reduce((acc: object, keys: string[]) => {
        _.set(acc, keys, true);
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
      } else if (typeof keyValue === "object" && "*" in keyValue) {
        result[key] = this.blacklist(model[key], keyValue["*"]);
      }
    });
    return result;
  }
}

export type ContentBlacklistMiddlewareParams = string[];

const alias = "content.except";

export const contentBlacklistMiddlewareBinding = [
  alias,
  ContentBlacklistMiddleware,
];

export function contentBlacklistMiddleware(
  ...params: ContentBlacklistMiddlewareParams
): ConfiguredMiddleware<ContentBlacklistMiddlewareParams> {
  return [alias, params];
}
