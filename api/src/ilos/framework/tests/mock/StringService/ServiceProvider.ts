import { ServiceProvider as BaseServiceProvider, env } from '@/ilos/core/index.ts';
import { RedisConnection } from '@/ilos/connection-redis/index.ts';
import { serviceProvider } from '@/ilos/common/index.ts';

import { HelloAction } from './actions/HelloAction.ts';
import { ResultAction } from './actions/ResultAction.ts';
import { LogAction } from './actions/LogAction.ts';
import { CustomProvider } from '../Providers/CustomProvider.ts';

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
