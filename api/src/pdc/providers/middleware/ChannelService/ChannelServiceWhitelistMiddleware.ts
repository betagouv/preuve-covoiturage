import { _ } from "@/deps.ts";

import {
  ContextType,
  ForbiddenException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { ConfiguredMiddleware } from "../interfaces.ts";

/*
 * Filter call from channel service
 */
@middleware()
export class ChannelServiceWhitelistMiddleware
  implements MiddlewareInterface<ChannelServiceWhitelistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    config: ChannelServiceWhitelistMiddlewareParams,
  ): Promise<ResultType> {
    const service = _.get(context, "channel.service", "");
    if (config.indexOf(service) < 0) {
      console.error(
        `Service is not reachable from ${service}, only [${config.join(", ")}]`,
      );
      throw new ForbiddenException(`Service is not reachable from ${service}`);
    }
    return next(params, context);
  }
}

export type ChannelServiceWhitelistMiddlewareParams = string[];

const alias = "channel_service.only";

export const channelServiceWhitelistMiddlewareBinding = [
  alias,
  ChannelServiceWhitelistMiddleware,
];

export function channelServiceWhitelistMiddleware(
  ...params: ChannelServiceWhitelistMiddlewareParams
): ConfiguredMiddleware<ChannelServiceWhitelistMiddlewareParams> {
  return [alias, params];
}
