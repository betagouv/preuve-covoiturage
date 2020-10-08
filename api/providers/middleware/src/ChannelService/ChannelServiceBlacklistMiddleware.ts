import { get } from 'lodash';

import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType, ForbiddenException } from '@ilos/common';

/*
 * Filter call from channel service
 */
@middleware()
export class ChannelServiceBlacklistMiddleware implements MiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next: Function, config: string[]): Promise<ResultType> {
    const service = get(context, 'channel.service', '');
    if (config.indexOf(service) >= 0) {
      throw new ForbiddenException(`Service is not reachable from ${service}`);
    }
    return next(params, context);
  }
}
