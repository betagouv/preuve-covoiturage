import { Job, Queue, JobOptions } from 'bull';

import { RedisConnection } from '@ilos/connection-redis';
import { HandlerInterface, InitHookInterface, CallType, HasLogger } from '@ilos/common';

import { bullFactory } from './helpers/bullFactory';

export class QueueHandler extends HasLogger implements HandlerInterface, InitHookInterface {
  public readonly middlewares: (string | [string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  protected defaultJobOptions: JobOptions = {
    removeOnComplete: true,
  };

  private client: Queue;

  constructor(protected redis: RedisConnection) {
    super();
  }

  public async init() {
    this.client = bullFactory(this.service, this.redis.getClient());
  }

  public async call(call: CallType): Promise<Job> {
    if (!this.client) {
      await this.init(); // FIXME
      // throw new Error('Redis queue handler initialization error');
    }

    try {
      const { method, params, context } = call;
      let options = { ...this.defaultJobOptions };

      // easy path to repeated/delayed jobs
      if (context && 'channel' in context && 'metadata' in context.channel) {
        options = { ...options, ...context.channel.metadata };
      }

      this.logger.debug(`Async call ${method}`, { params, context });
      const job = await this.client.add(
        {
          method,
          jsonrpc: '2.0',
          id: null,
          params: {
            params,
            _context: context,
          },
        },
        options,
      );

      return job;
    } catch (e) {
      this.logger.debug(`Async call ${call.method} failed`, e);
      throw new Error('An error occured');
    }
  }
}
