import _ from 'lodash';
import http from 'node:http';
import express from 'express';
import { TransportInterface } from '@/ilos/common/index.ts';
import { QueueTransport } from '@/ilos/transport-redis/index.ts';
import { SentryProvider } from '@/pdc/providers/sentry/index.ts';
import { env } from '@/ilos/core/index.ts';

import { healthCheckFactory } from './helpers/healthCheckFactory.ts';
import { prometheusMetricsFactory } from './helpers/prometheusMetricsFactory.ts';
import { metricsMiddleware } from './middlewares/metricsMiddleware.ts';

export class MyQueueTransport extends QueueTransport implements TransportInterface {
  server: http.Server;
  app: express.Express;

  protected errorHandler(err: Error, job?: any) {
    const sentry = this.kernel.getContainer().get(SentryProvider).getClient();
    sentry.setTag('transport', 'queue');
    sentry.setTag('status', 'failed');
    sentry.setExtra('rpc_error', _.get(err, 'rpcError.data', null));
    if (job) {
      sentry.setExtra('job_payload', _.get(job, 'data.params.params', null));
      sentry.setExtra('job', _.omit(job, ['data', 'stacktrace']));
    }
    sentry.captureException(err);
  }

  async up(opts: string[] = []): Promise<void> {
    await super.up(opts);
    if (env.or_false('MONITORING')) {
      this.app = express();
      this.setupServer();
      this.startServer();
    }
  }

  async down(): Promise<void> {
    await super.down();
    if (this.server) {
      this.server.close();
    }
  }

  async setupServer() {
    this.app.get('/health', metricsMiddleware('health'), healthCheckFactory([]));
    this.app.get('/metrics', metricsMiddleware('metrics'), prometheusMetricsFactory());
  }

  async startServer() {
    const port = env.or_int('PORT', 8080);
    this.server = this.app.listen(port, () => console.info(`Listening on port ${port}`));
  }
}
