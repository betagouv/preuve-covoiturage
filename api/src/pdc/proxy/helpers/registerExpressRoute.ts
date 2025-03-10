import { ContextType, KernelInterface, RouteParams } from "@/ilos/common/index.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { setSentryUser } from "@/pdc/proxy/helpers/setSentryUser.ts";
import { rateLimiter } from "@/pdc/proxy/middlewares/rateLimiter.ts";
import { serverTokenMiddleware } from "@/pdc/proxy/middlewares/serverTokenMiddleware.ts";
import { express, NextFunction, Request, Response } from "dep:express";
import { formatRange, parse, satisfies, tryParseRange } from "dep:semver";

const SUPPORTED_VERSIONS = ["3.2.0"].map((v) => parse(v));
const defaultParams: Required<Pick<RouteParams, "successHttpCode" | "rateLimiter">> = {
  successHttpCode: 200,
  rateLimiter: {
    key: "rl",
    limit: 100,
    windowMinute: 5,
  },
};

export function registerExpressRoute(
  app: express.Express,
  kernel: KernelInterface,
  params: Omit<RouteParams, "action"> & Required<Pick<RouteParams, "action">>,
) {
  const tokenProvider = kernel.get<TokenProvider>(TokenProvider);
  const rateLimiterParams = params.rateLimiter || defaultParams.rateLimiter;
  const middlewares: Array<express.RequestHandler> = [
    serverTokenMiddleware(kernel, tokenProvider),
    rateLimiter({
      windowMs: rateLimiterParams.windowMinute * 60_000,
      max: rateLimiterParams.limit,
    }, rateLimiterParams.key),
  ];

  const path = `/:api_version/${params.path}`.replaceAll("//", "/");
  app[params.method.toLocaleLowerCase()](path, [
    ...middlewares,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const user = req.session?.user || {};
      setSentryUser(req);
      const { api_version, ...rparams } = req.params;

      const versionRange = tryParseRange(api_version);
      if (!versionRange) {
        return res.status(404).end();
      }
      if (!SUPPORTED_VERSIONS.some((version) => satisfies(version, versionRange))) {
        return res.status(404).end();
      }
      const p = params.actionParamsFn ? await params.actionParamsFn(req) : { ...req.query, ...req.body, ...rparams };
      const ctxt: ContextType = params.actionContextFn ? await params.actionContextFn(req) : {
        channel: {
          service: "proxy",
          transport: "http",
        },
        call: {
          user,
          api_version_range: formatRange(versionRange),
        },
      };
      try {
        const response = await kernel.call(params.action, p, ctxt);
        res.status((params.successHttpCode || defaultParams.successHttpCode) as any);
        if (params.responseFn) {
          return await params.responseFn(res, response);
        }
        if (params.rpcAnswerOnSuccess) {
          return res.json({
            jsonrpc: "2.0",
            id: 1,
            result: response,
          });
        }
        if (response) {
          return res.json(response);
        }
        return res.end();
      } catch (e) {
        res.status(e.httpCode || 500);
        if (params.rpcAnswerOnFailure) {
          return res.json({
            jsonrpc: "2.0",
            id: 1,
            error: e.rpcError || { message: e.message },
          });
        }
        return res.json(e.rpcError?.data || { error: e.message || "An unexpected error occurred." });
      }
    }),
  ]);
}
