import { get, omit } from 'lodash';
import http from 'http';
import express from 'express';
import { TransportInterface } from '@ilos/common';
import { QueueTransport } from '@ilos/transport-redis';
import { SentryProvider } from '@pdc/provider-sentry';
import { env } from '@ilos/core';

import { healthCheckFactory } from './helpers/healthCheckFactory';
import { prometheusMetricsFactory } from './helpers/prometheusMetricsFactory';
import { metricsMiddleware } from './middlewares/metricsMiddleware';

export class MyQueueTransport extends QueueTransport implements TransportInterface {
  server: http.Server;
  app: express.Express;

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

  async up(opts: string[] = []): Promise<void> {
    await super.up(opts);
    if (env.or_false(MONITORING)) {
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
