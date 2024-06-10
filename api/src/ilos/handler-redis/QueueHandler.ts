import { _, Job, JobsOptions, Queue, QueueOptions } from "@/deps.ts";
import {
  CallType,
  HandlerInterface,
  InitHookInterface,
} from "@/ilos/common/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";

export class QueueHandler implements HandlerInterface, InitHookInterface {
  public readonly middlewares: (string | [string, any])[] = [];

  protected readonly service: string | null = null;
  protected readonly version: string | null = null;

  protected defaultJobOptions: JobsOptions = {
    removeOnComplete: true,
  };

  private client: Queue | null = null;

  constructor(protected redis: RedisConnection) {}

  protected createQueue(): Queue {
    if (!this.service) {
      throw new Error("QueueHandler: Service name is required");
    }

    const options = { connection: this.redis.getClient() } as QueueOptions;
    return new Queue(this.service, options);
  }

  public getClient(): Queue | void {
    if (!this.client) return;
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
      if (context && "channel" in context && "metadata" in context.channel) {
        options = { ...options, ...context.channel.metadata };
      }

      // protect against char : in jobId
      if (options.jobId && _.isString(options.jobId)) {
        if ((options.jobId as string).indexOf(":") > -1) {
          throw new Error('Character ":" is unsupported in jobId');
        }
      }

      // clean up repeatableJob and their associated delayed job
      // works even if repeat options have changed
      if (options.repeat) {
        const jobs = await this.client?.getRepeatableJobs() || [];
        for (const job of jobs) {
          if (job.id === options.jobId) {
            await this.client?.removeRepeatableByKey(job.key);
            console.debug(`Removed repeatable job ${options.jobId}`);
          }
        }

        const delayedJobs = await this.client?.getJobs(["delayed"]) || [];
        for (const job of delayedJobs) {
          if (_.get(job, "opts.repeat.jobId") === options.jobId) {
            await job.remove();
            console.debug(`Removed delayed job ${options.jobId}`);
          }
        }
      }

      const job = this.client && await this.client.add(
        method,
        {
          method,
          jsonrpc: "2.0",
          id: null,
          params: {
            params,
            _context: context,
          },
        },
        options,
      );

      if (!job) {
        throw new Error(`Failed to create job: ${method}`);
      }

      return job;
    } catch (e) {
      console.error(`Async call ${call.method} failed`, e);
      throw new Error("An error occured");
    }
  }
}
