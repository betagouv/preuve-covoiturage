import { ServiceProvider as BaseServiceProvider, env } from '@ilos/core';
import { RedisConnection } from '@ilos/connection-redis';
import { serviceProvider } from '@ilos/common';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';
import { LogAction } from './actions/LogAction';
import { CustomProvider } from '../Providers/CustomProvider';

@serviceProvider({
  config: {
    string: { hello: 'Hello world' },
  },
  providers: [CustomProvider],
  handlers: [HelloAction, ResultAction, LogAction],
  queues: ['string'],
  connections: [[RedisConnection, new RedisConnection(env.or_fail('APP_REDIS_URL', 'redis://127.0.0.1:6379'))]],
})
export class ServiceProvider extends BaseServiceProvider {
  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set('string:');
  }
}
