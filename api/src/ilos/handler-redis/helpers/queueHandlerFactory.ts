import { RedisConnection } from '@ilos/connection-redis/index.ts';
import { handler, NewableType } from '@ilos/common/index.ts';

import { QueueHandler } from '../QueueHandler.ts';

export function queueHandlerFactory(service: string, version = 'latest'): NewableType<QueueHandler> {
  @handler({
    service,
    version,
    method: '*',
    local: true,
    queue: true,
  })
  class CustomQueueHandler extends QueueHandler {
    readonly service: string = service;
    readonly version: string = version;

    constructor(protected redis: RedisConnection) {
      super(redis);
    }
  }

  return CustomQueueHandler;
}
