import { RedisConnection } from '@ilos/connection-redis';
import { handler, NewableType } from '@ilos/common';

import { QueueHandler } from '../QueueHandler';

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
