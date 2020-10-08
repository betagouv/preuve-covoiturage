import { Queue } from 'bull';
import { get, omit } from 'lodash';
import { TransportInterface } from '@ilos/common';
import { QueueTransport } from '@ilos/transport-redis';
import { Sentry, SentryProvider } from '@pdc/provider-sentry';

export class MyQueueTransport extends QueueTransport implements TransportInterface {
  async up(opts: string[] = []): Promise<void> {
    this.kernel.getContainer().get(SentryProvider);

    await super.up(opts);
  }

  protected registerListeners(queue: Queue, name: string, errorHandler?: Function): void {
    queue.on('error', (err) => {
      console.log(`[🐮]/${name}: error`, err.message);
      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });

    queue.on('waiting', (jobId) => {
      console.log(`[🐮]/${name}: waiting ${jobId}`);
    });

    queue.on('active', (job) => {
      console.log(`[🐮]/${name}: active ${job.id} ${job.data.method}`);
    });

    queue.on('stalled', (job) => {
      console.log(`[🐮]/${name}: stalled ${job.id} ${job.data.method}`);
    });

    queue.on('progress', (job, progress) => {
      console.log(`[🐮]/${name}: progress ${job.id} ${job.data.method} : ${progress}`);
    });

    queue.on('completed', (job) => {
      console.log(`[🐮]/${name}: completed ${job.id} ${job.data.method}`);
      // job.remove();
    });

    queue.on('failed', (job, err) => {
      Sentry.setTag('transport', 'queue');
      Sentry.setTag('status', 'failed');
      Sentry.setExtra('rpc_error', get(err, 'rpcError.data', null));
      Sentry.setExtra('job_payload', get(job, 'data.params.params', null));
      Sentry.setExtra('job', omit(job, ['data', 'stacktrace']));
      Sentry.captureException(err);

      // @ts-ignore
      // console.log(err.rpcError);
      console.log(`[🐮]/${name}: failed ${job.id}`, err.message);

      if (errorHandler && typeof errorHandler === 'function') {
        errorHandler(err);
      }
    });
  }
}
