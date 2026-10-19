// from https://github.com/banzaicloud/services/tools/blob/master/src/middleware/express/health-check.ts
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { registerOnSignal } from "@/lib/process/index.ts";
import { Request, RequestHandler, Response } from "dep:express";

const log = taggedLogger("[http]");

export function healthCheckFactory(
  checks: Array<() => Promise<any>> = [],
): RequestHandler {
  // respond with '503 Service Unavailable' once the termination signal is received
  let shuttingDown = false;
  registerOnSignal("SIGTERM", () => {
    shuttingDown = true;
  });

  return async function healthCheck(req: Request, res: Response) {
    if (shuttingDown) {
      res.status(503).send({
        status: "error",
        details: {
          reason: "service is shutting down",
        },
      });
      return;
    }

    for (const check of checks) {
      try {
        await check();
      } catch (err) {
        log.error("health check failed", { error: errorCode(err) });
        res.status(500).send({
          status: "error",
        });
        return;
      }
    }

    res.status(200).send({
      status: "ok",
    });
  };
}
