import { Job, Queue, JobsOptions, QueueOptions } from 'bullmq';
import _ from 'lodash';
import { RedisConnection } from '@ilos/connection-redis/index.ts';
import { HandlerInterface, InitHookInterface, CallType } from '@ilos/common/index.ts';

export class QueueHandler implements HandlerInterface, InitHookInterface {
  public readonly middlewares: (string | [string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;

  protected defaultJobOptions: JobsOptions = {
    removeOnComplete: true,
  };

  private client: Queue;

  constructor(protected redis: RedisConnection) {}

  protected createQueue(): Queue {
    const options = { connection: this.redis.getClient() } as QueueOptions;
    return new Queue(this.service, options);
  }

  public getClient(): Queue {
    return this.client;
  }

  public async init() {
    this.client = this.createQueue();
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
      if (options.jobId && _.isString(options.jobId)) {
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
            console.debug(`Removed repeatable job ${options.jobId}`);
          }
        }

        for (const job of await this.client.getJobs(['delayed'])) {
          if (_.get(job, 'opts.repeat.jobId') === options.jobId) {
            await job.remove();
            console.debug(`Removed delayed job ${options.jobId}`);
          }
        }
      }

      const job = await this.client.add(
        method,
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
      console.error(`Async call ${call.method} failed`, e);
      throw new Error('An error occured');
    }
  }
}
