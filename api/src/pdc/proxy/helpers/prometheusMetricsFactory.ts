// from https://github.com/banzaicloud/services/tools/blob/master/src/middleware/express/prometheus-metrics.ts
import { Request, RequestHandler, Response } from "dep:express";
import promClient from "dep:prom-client";

export function prometheusMetricsFactory({
  client = promClient,
  collectDefaultMetrics = false,
  defaultLabels = {},
} = {}): RequestHandler {
  if (collectDefaultMetrics) {
    client.collectDefaultMetrics();
  }

  if (Object.keys(defaultLabels).length) {
    client.register.setDefaultLabels(defaultLabels);
  }

  return function prometheusMetrics(req: Request, res: Response) {
    const metrics = client.register.metrics();
    res.set("Content-Type", client.register.contentType).send(metrics);
  };
}
