import {
  ContextType,
  ForbiddenException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { get } from "@/lib/object/index.ts";
import { ConfiguredMiddleware } from "../interfaces.ts";

/*
 * Filter call from channel service
 */
@middleware()
export class ChannelServiceBlacklistMiddleware
  implements MiddlewareInterface<ChannelServiceBlacklistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    config: ChannelServiceBlacklistMiddlewareParams,
  ): Promise<ResultType> {
    const service = get(context, "channel.service", "");
    if (config.indexOf(service) >= 0) {
      throw new ForbiddenException(`Service is not reachable from ${service}`);
    }
    return next(params, context);
  }
}

export type ChannelServiceBlacklistMiddlewareParams = string[];

const alias = "channel_service.except";

export const channelServiceBlacklistMiddlewareBinding = [
  alias,
  ChannelServiceBlacklistMiddleware,
];

export function channelServiceBlacklistMiddleware(
  ...params: ChannelServiceBlacklistMiddlewareParams
): ConfiguredMiddleware<ChannelServiceBlacklistMiddlewareParams> {
  return [alias, params];
}
