import { get } from 'lodash';

import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType, ForbiddenException } from '@ilos/common';
import { ConfiguredMiddleware } from '../interfaces';

/*
 * Filter call from channel service
 */
@middleware()
export class ChannelServiceWhitelistMiddleware implements MiddlewareInterface<ChannelServiceWhitelistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    config: ChannelServiceWhitelistMiddlewareParams,
  ): Promise<ResultType> {
    const service = get(context, 'channel.service', '');
    if (config.indexOf(service) < 0) {
      throw new ForbiddenException(`Service is not reachable from ${service}`);
    }
    return next(params, context);
  }
}

export type ChannelServiceWhitelistMiddlewareParams = string[];

const alias = 'channel_service.only';

export const channelServiceWhitelistMiddlewareBinding = [alias, ChannelServiceWhitelistMiddleware];

export function channelServiceWhitelistMiddleware(
  ...params: ChannelServiceWhitelistMiddlewareParams
): ConfiguredMiddleware<ChannelServiceWhitelistMiddlewareParams> {
  return [alias, params];
}
