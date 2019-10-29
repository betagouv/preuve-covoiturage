import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType, ForbiddenException } from '@ilos/common';

/*
 * Filter call from channel transport
 */
@middleware()
export class ChannelTransportMiddleware implements MiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next: Function, config: string[]): Promise<ResultType> {
    const transport = 'transport' in context.channel ? context.channel.transport : '';
    if (config.indexOf(transport) < 0) {
      throw new ForbiddenException(`Service is not reachable from ${transport}`);
    }
    return next(params, context);
  }
}
