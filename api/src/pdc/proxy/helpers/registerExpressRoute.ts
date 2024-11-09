import { express, NextFunction, Request, Response, semver } from "@/deps.ts";
import { ContextType, KernelInterface, ParamsType } from "@/ilos/common/index.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { setSentryUser } from "@/pdc/proxy/helpers/setSentryUser.ts";
import { rateLimiter } from "@/pdc/proxy/middlewares/rateLimiter.ts";
import { serverTokenMiddleware } from "@/pdc/proxy/middlewares/serverTokenMiddleware.ts";

export interface RouteParams {
  path: string;
  method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
  rateLimiter?: {
    windowMinute: number;
    limit: number;
    key: string;
  };
  action: string;
  successHttpCode?: number;
  actionParamsFn?: (req: Request) => Promise<ParamsType>;
  actionContextFn?: (req: Request) => Promise<ContextType>;
  responseFn?: (res: Response, result: unknown) => Promise<void>;
  rpcAnswerOnSuccess?: boolean;
  rpcAnswerOnFailure?: boolean;
}

export function registerExpressRoute(app: express.Express, kernel: KernelInterface, params: RouteParams) {
  const tokenProvider = kernel.get<TokenProvider>(TokenProvider);
  const middlewares: Array<express.RequestHandler> = [
    serverTokenMiddleware(kernel, tokenProvider),
  ];
  if (params.rateLimiter) {
    middlewares.push(rateLimiter({
      windowMs: params.rateLimiter.windowMinute * 60_000,
      max: params.rateLimiter.limit,
    }, params.rateLimiter.key));
  }
  const path = `/:api_version/${params.path}`.replaceAll("//", "/");
  app[params.method.toLocaleLowerCase()](path, [
    ...middlewares,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const user = req.session?.user || {};
      setSentryUser(req);
      const { api_version, ...rparams } = req.params;

      const versionRange = semver.tryParseRange(api_version);
      if (!versionRange) {
        return res.status(404).end();
      }
      if (
        !semver.satisfies(semver.parse("3.0.0"), versionRange) && !semver.satisfies(semver.parse("3.1.0"), versionRange)
      ) {
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
          api_version_range: semver.formatRange(versionRange),
        },
      };
      try {
        const response = await kernel.call(params.action, p, ctxt);
        res.status((params.successHttpCode || 200) as any);
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
