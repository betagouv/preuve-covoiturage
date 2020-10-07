import { Job, Queue, JobOptions } from 'bull';
import { get, isString } from 'lodash';

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

      // protect against char : in jobId
      if (options.jobId && isString(options.jobId)) {
        if ((options.jobId as string).indexOf(':') > -1) {
          throw new Error('Character ":" is unsupported in jobId');
        }
      }

      // clean up repeatableJob and their associated delayed job
      // works even if repeat options have changed
      if (options.repeat) {
        for (const job of await this.client.getRepeatableJobs()) {
          if (job.id === options.jobId) {
            await this.client.removeRepeatableByKey(job.key);
            this.logger.debug(`Removed repeatable job ${options.jobId}`);
          }
        }

        for (const job of await this.client.getJobs(['delayed'])) {
          if (get(job, 'opts.repeat.jobId') === options.jobId) {
            await job.remove();
            this.logger.debug(`Removed delayed job ${options.jobId}`);
          }
        }
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
