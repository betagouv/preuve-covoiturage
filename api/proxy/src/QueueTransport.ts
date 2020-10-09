import { get, omit } from 'lodash';
import { TransportInterface } from '@ilos/common';
import { QueueTransport } from '@ilos/transport-redis';
import { SentryProvider } from '@pdc/provider-sentry';

export class MyQueueTransport extends QueueTransport implements TransportInterface {
  protected errorHandler(err: Error, job?: any) {
    const sentry = this.kernel.getContainer().get(SentryProvider).getClient();
    sentry.setTag('transport', 'queue');
    sentry.setTag('status', 'failed');
    sentry.setExtra('rpc_error', get(err, 'rpcError.data', null));
    if (job) {
      sentry.setExtra('job_payload', get(job, 'data.params.params', null));
      sentry.setExtra('job', omit(job, ['data', 'stacktrace']));
    }
    sentry.captureException(err);
  }
}
