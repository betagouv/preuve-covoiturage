import {
  bodyParser,
  cors,
  express,
  expressSession,
  helmet,
  http,
  NextFunction,
  Redis,
  RedisStore,
  Request,
  Response,
} from "@/deps.ts";
import {
  ConfigInterface,
  ConfigInterfaceResolver,
  InvalidRequestException,
  KernelInterface,
  RPCResponseType,
  RPCSingleCallType,
  TransportInterface,
  UnauthorizedException,
} from "@/ilos/common/index.ts";
import { env_or_fail, env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { get } from "@/lib/object/index.ts";
import { join } from "@/lib/path/index.ts";
import { Sentry, SentryProvider } from "@/pdc/providers/sentry/index.ts";
import { TokenProviderInterfaceResolver } from "@/pdc/providers/token/index.ts";
import { registerExpressRoute, RouteParams } from "@/pdc/proxy/helpers/registerExpressRoute.ts";
import { serverTokenMiddleware } from "@/pdc/proxy/middlewares/serverTokenMiddleware.ts";
import { TokenPayloadInterface } from "@/pdc/services/application/contracts/common/interfaces/TokenPayloadInterface.ts";
import {
  ParamsInterface as GetAuthorizedCodesParams,
  ResultInterface as GetAuthorizedCodesResult,
  signature as getAuthorizedCodesSignature,
} from "@/pdc/services/territory/contracts/getAuthorizedCodes.contract.ts";
import { signature as deleteCeeSignature } from "../services/cee/contracts/deleteApplication.contract.ts";
import { signature as findCeeSignature } from "../services/cee/contracts/findApplication.contract.ts";
import { signature as importCeeSignature } from "../services/cee/contracts/importApplication.contract.ts";
import { signature as importIdentityCeeSignature } from "../services/cee/contracts/importApplicationIdentity.contract.ts";
import { signature as registerCeeSignature } from "../services/cee/contracts/registerApplication.contract.ts";
import { signature as simulateCeeSignature } from "../services/cee/contracts/simulateApplication.contract.ts";
import { ResultInterface as DownloadCertificateResultInterface } from "../services/certificate/contracts/download.contract.ts";
import { asyncHandler } from "./helpers/asyncHandler.ts";
import { createRPCPayload } from "./helpers/createRPCPayload.ts";
import { healthCheckFactory } from "./helpers/healthCheckFactory.ts";
import { injectContext } from "./helpers/injectContext.ts";
import { mapStatusCode } from "./helpers/mapStatusCode.ts";
import { prometheusMetricsFactory } from "./helpers/prometheusMetricsFactory.ts";
import { CacheMiddleware, cacheMiddleware, CacheTTL } from "./middlewares/cacheMiddleware.ts";
import { dataWrapMiddleware, errorHandlerMiddleware } from "./middlewares/index.ts";
import { metricsMiddleware } from "./middlewares/metricsMiddleware.ts";
import {
  apiRateLimiter,
  authRateLimiter,
  contactformRateLimiter,
  loginRateLimiter,
  monHonorCertificateRateLimiter,
  rateLimiter,
} from "./middlewares/rateLimiter.ts";

export class HttpTransport implements TransportInterface {
  app: express.Express;
  config: ConfigInterface;
  port: string;
  server: http.Server;
  tokenProvider: TokenProviderInterfaceResolver;
  cache: CacheMiddleware;

  constructor(private kernel: KernelInterface) {}

  getKernel(): KernelInterface {
    return this.kernel;
  }

  getInstance(): http.Server {
    return this.server;
  }

  async up(opts: string[] = []): Promise<void> {
    this.getProviders();

    const optsPort = parseInt(opts[0], 10);
    const port = optsPort || optsPort === 0 ? optsPort : this.config.get("proxy.port", 8080);

    this.app = express();
    this.setup();

    this.start(port);
  }

  async down(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
  }

  setup(): void {
    this.registerBeforeAllHandlers();
    this.registerBodyHandler();
    this.registerSessionHandler();
    this.registerSecurity();
    this.registerMetrics();
    this.registerGlobalMiddlewares();
    this.registerCache();
    this.registerAuthRoutes();
    this.registerApplicationRoutes();
    this.registerCertificateRoutes();
    this.registerAcquisitionRoutes();
    this.registerSimulationRoutes();
    this.registerCeeRoutes();
    this.registerHonorRoutes();
    this.registerDashboardRoutes();
    this.registerObservatoryRoutes();
    this.registerContactformRoute();
    this.registerCallHandler();
    this.registerAfterAllHandlers();
    this.registerGeoRoutes();
    this.registerExportRoutes();
    this.registerStaticFolder();
  }

  getApp(): express.Express {
    return this.app;
  }

  private async getProviders(): Promise<void> {
    this.config = this.kernel.getContainer().get(ConfigInterfaceResolver);
    this.tokenProvider = this.kernel.getContainer().get(
      TokenProviderInterfaceResolver,
    );
  }

  private registerBeforeAllHandlers(): void {
    this.kernel.getContainer().get(SentryProvider);
    Sentry.setTag("transport", "node:http");
    Sentry.setTag("version", this.config.get("sentry.version"));
  }

  private registerBodyHandler(): void {
    this.app.use(bodyParser.json({ limit: "2mb" }));
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private registerSessionHandler(): void {
    // needed for reverse-proxy compatibility
    // must be set before configuring the session
    this.app.set("trust proxy", 1);

    const sessionSecret = this.config.get("proxy.session.secret");
    const sessionName = this.config.get("proxy.session.name");
    const redisConfig = this.config.get("connections.redis");
    const redis = new Redis(redisConfig);

    const sessionMiddleware = expressSession({
      cookie: {
        path: "/",
        httpOnly: true,
        maxAge: this.config.get("proxy.session.maxAge"),
        // https everywhere but in local development
        secure: env_or_fail("APP_ENV", "local") !== "local",
        sameSite: env_or_fail("APP_ENV", "local") !== "local" ? "none" : "strict",
      },

      name: sessionName,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redis, prefix: "proxy:" }),
    });

    this.app.use(function (req: Request, res: Response, next: NextFunction) {
      if (req.headers.authorization) {
        return next();
      }
      return sessionMiddleware(req, res, next);
    });
  }

  private registerSecurity(): void {
    // protect with typical headers and enable cors
    this.app.use(helmet());

    // apply CORS to all routes except the following ones
    this.app.use(
      /\/((?!honor|contactform|policy\/simulate|observatory|geo\/search).)*/,
      cors({
        origin: this.config.get("proxy.cors"),
        optionsSuccessStatus: 200,
        // Allow-Access-Credentials lets XHR requests send Cookies to a different URL
        credentials: true,
      }),
    );

    this.app.use(
      /\/(observatory|geo\/search)/i,
      cors({
        origin: this.config.get("proxy.observatoryCors"),
        optionsSuccessStatus: 200,
      }),
    );

    // apply specific cors policy
    this.app.use(
      "/honor",
      cors({
        origin: this.config.get("proxy.certUrl"),
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      "/contactform",
      cors({
        origin: this.config.get("proxy.showcase"),
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      "/geo/search",
      cors({
        origin: this.config.get("proxy.showcase"),
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      "/policy/simulate",
      cors({
        origin: this.config.get("proxy.showcase"),
        optionsSuccessStatus: 200,
      }),
    );
  }

  private registerGlobalMiddlewares(): void {
    // maintenance mode
    this.app.use((_req: Request, res: Response, next: NextFunction) => {
      if (env_or_false("APP_MAINTENANCE")) {
        res.status(503).json({ code: 503, error: "Service Unavailable" });
        return;
      }

      next();
    });

    // FIXME : expressMung.jsonAsync makes the response body undefined
    // this.app.use(signResponseMiddleware);
    this.app.use(dataWrapMiddleware);
  }

  private registerCache(): void {
    // create Redis connection only when the cache is enabled
    const enabled = this.config.get("cache.enabled");
    const gzipped = this.config.get("cache.gzipped");
    const authToken = this.config.get("cache.authToken");
    const driver = enabled ? new Redis(this.config.get("connections.redis")) : null;
    this.cache = cacheMiddleware({ enabled, driver, gzipped, authToken });

    this.app.delete(
      "/cache",
      rateLimiter(),
      this.cache.auth(),
      asyncHandler(async (req: Request, res: Response) => {
        const prefix = (req.query.prefix as string | undefined) || "*";
        const result = await this.cache.flush(prefix);
        res.status(200).json({ id: 1, jsonrpc: "2.0", result });
      }),
    );
  }

  private registerMetrics(): void {
    this.app.get(
      "/health",
      metricsMiddleware("health"),
      healthCheckFactory([]),
    );
    this.app.get(
      "/metrics",
      metricsMiddleware("metrics"),
      prometheusMetricsFactory(),
    );
  }

  private registerExportRoutes(): void {
    /**
     * Export trips from a V2 payload to a V3 output file.
     *
     * The V2 way to handle exports is done throught the /rpc route calling
     * the trip:export method.
     *
     * @deprecated This should be removed when the dashboard is updated.
     */
    this.app.post(
      "/v2/exports",
      rateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req: Request, res: Response) => {
        const user = get(req, "session.user", {});
        const action = `export:createVersionTwo`;
        const response = await this.kernel.handle(
          createRPCPayload(action, req.body, user, { req }),
        );
        this.send(res, response);
      }),
    );

    const routes: Array<RouteParams> = [
      {
        path: "/exports",
        action: "export:createVersionThree",
        method: "POST",
        successHttpCode: 201,
      },
      {
        path: "/exports",
        action: "export:list",
        method: "GET",
      },
      {
        path: "/exports/:uuid",
        action: "export:get",
        method: "GET",
      },
      {
        path: "/exports/:uuid/status",
        action: "export:status",
        method: "GET",
      },
      {
        path: "/exports/:uuid/attachment",
        action: "export:download",
        method: "GET",
      },
      {
        path: "/exports/:uuid",
        action: "export:delete",
        method: "DELETE",
      },
    ];
    routes.map((c) => registerExpressRoute(this.app, this.kernel, c));
  }

  private registerCeeRoutes(): void {
    const routes: Array<RouteParams> = [
      {
        path: "/policies/cee",
        action: registerCeeSignature,
        method: "POST",
        successHttpCode: 201,
        rateLimiter: {
          key: "rl-cee",
          limit: 20_000,
          windowMinute: 1,
        },
      },
      {
        path: "/policies/cee/simulate",
        action: simulateCeeSignature,
        method: "POST",
        successHttpCode: 200,
        rateLimiter: {
          key: "rl-cee",
          limit: 20_000,
          windowMinute: 1,
        },
      },
      {
        path: "/policies/cee/import",
        action: importCeeSignature,
        method: "POST",
        successHttpCode: 201,
        rateLimiter: {
          key: "rl-cee",
          limit: 20_000,
          windowMinute: 1,
        },
      },
      {
        path: "/policies/cee/import/identity",
        action: importIdentityCeeSignature,
        method: "POST",
        successHttpCode: 200,
        rateLimiter: {
          key: "rl-cee",
          limit: 20_000,
          windowMinute: 1,
        },
      },
      {
        path: "/policies/cee/:uuid",
        action: findCeeSignature,
        method: "GET",
        successHttpCode: 200,
        rateLimiter: {
          key: "rl-cee",
          limit: 20_000,
          windowMinute: 1,
        },
      },
      {
        path: "/policies/cee/:uuid",
        action: deleteCeeSignature,
        method: "DELETE",
        successHttpCode: 204,
        rateLimiter: {
          key: "rl-cee",
          limit: 20_000,
          windowMinute: 1,
        },
      },
    ];
    routes.map((c) => registerExpressRoute(this.app, this.kernel, c));
  }

  private registerSimulationRoutes(): void {
    registerExpressRoute(this.app, this.kernel, {
      path: "/policies/simulate",
      action: "campaign:simulateOnFuture",
      method: "POST",
    });
    this.app.post(
      "/policy/simulate",
      rateLimiter({ max: 1 }, "rl-policy-simulate"),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        // TODO : Should be queued
        await this.kernel.call("user:sendSimulationEmail", req.body, {
          call: { user: { permissions: ["common.user.policySimulate"] } },
          channel: {
            service: "proxy",
          },
        });
        this.send(res, { id: 1, jsonrpc: "2.0" });
      }),
    );
  }

  private registerGeoRoutes(): void {
    this.app.post(
      "/geo/search",
      rateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const response = await this.kernel.handle(
          createRPCPayload(
            "territory:listGeo",
            { search: req.body.search, exclude_coms: req.body.exclude_coms },
            { permissions: ["common.territory.list"] },
          ),
        );
        this.send(res, response as RPCResponseType);
      }),
    );

    registerExpressRoute(this.app, this.kernel, {
      path: "/geo/route",
      action: "geo:getRouteMeta",
      method: "GET",
      rateLimiter: {
        key: "rl-acquisition-check",
        limit: 2_000,
        windowMinute: 1,
      },
      async actionParamsFn(req) {
        const q = { ...req.query };
        q.start = {
          lat: parseFloat(q.start?.lat),
          lon: parseFloat(q.start?.lon),
        };
        q.end = {
          lat: parseFloat(q.end?.lat),
          lon: parseFloat(q.end?.lon),
        };
        return q;
      },
      rpcAnswerOnFailure: true,
    });

    registerExpressRoute(this.app, this.kernel, {
      path: "/geo/point/by_address",
      action: "geo:getPointByAddress",
      method: "GET",
      rateLimiter: {
        key: "rl-acquisition-check",
        limit: 2_000,
        windowMinute: 1,
      },
      rpcAnswerOnFailure: true,
    });

    registerExpressRoute(this.app, this.kernel, {
      path: "/geo/point/by_insee",
      action: "geo:getPointByCode",
      method: "GET",
      rateLimiter: {
        key: "rl-acquisition-check",
        limit: 2_000,
        windowMinute: 1,
      },
      rpcAnswerOnFailure: true,
    });
  }

  /**
   * Journeys routes
   * - check status
   * - invalidate
   * - save
   */
  private registerAcquisitionRoutes(): void {
    registerExpressRoute(this.app, this.kernel, {
      path: "/journeys/:operator_journey_id",
      action: "acquisition:status",
      method: "GET",
      rateLimiter: {
        key: "rl-acquisition-check",
        limit: 2_000,
        windowMinute: 1,
      },
      rpcAnswerOnSuccess: false,
      rpcAnswerOnFailure: true,
    });

    registerExpressRoute(this.app, this.kernel, {
      path: "/journeys/:operator_journey_id",
      action: "acquisition:patch",
      method: "PATCH",
      rateLimiter: {
        key: "rl-acquisition-check",
        limit: 2_000,
        windowMinute: 1,
      },
      rpcAnswerOnSuccess: false,
      rpcAnswerOnFailure: true,
    });

    registerExpressRoute(this.app, this.kernel, {
      path: "/journeys/:operator_journey_id/cancel",
      action: "acquisition:cancel",
      method: "POST",
      rateLimiter: {
        key: "rl-acquisition",
        limit: 20_000,
        windowMinute: 1,
      },
      rpcAnswerOnSuccess: true,
      rpcAnswerOnFailure: true,
    });

    registerExpressRoute(this.app, this.kernel, {
      path: "/journeys",
      action: "acquisition:create",
      method: "POST",
      successHttpCode: 201,
      rateLimiter: {
        key: "rl-acquisition",
        limit: 20_000,
        windowMinute: 1,
      },
      rpcAnswerOnSuccess: true,
      rpcAnswerOnFailure: true,
    });

    registerExpressRoute(this.app, this.kernel, {
      path: "/journeys",
      action: "acquisition:list",
      method: "GET",
      rateLimiter: {
        key: "rl-acquisition-check",
        limit: 2_000,
        windowMinute: 1,
      },
      rpcAnswerOnSuccess: false,
      rpcAnswerOnFailure: true,
      async actionParamsFn(req) {
        const { query } = req;
        const q = {
          ...query,
        };
        if ("offset" in q) {
          q.offset = parseInt(q.offset, 10);
        }
        if ("limit" in q) {
          q.limit = parseInt(q.limit, 10);
        }
        return q;
      },
    });
  }

  private registerAuthRoutes(): void {
    /**
     * Log the user in based on email and password combination
     */
    this.app.post(
      "/login",
      loginRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const response = (await this.kernel.handle(
          createRPCPayload("user:login", req.body),
        )) as RPCResponseType;

        if (!response || Array.isArray(response) || "error" in response) {
          res.status(mapStatusCode(response)).json(
            this.parseErrorData(response),
          );
        } else {
          const user = Array.isArray(response) ? response[0].result : response.result;
          req.session.user = {
            ...user,
            ...(await this.getTerritoryInfos(user)),
          };

          this.send(res, response);
        }
      }),
    );

    /**
     * Get the user profile (reads from the session rather than the database)
     */
    this.app.get(
      "/profile",
      authRateLimiter(),
      (req: Request, res: Response, _next: NextFunction) => {
        if (!("user" in req.session)) {
          throw new UnauthorizedException();
        }

        res.json(get(req.session, "user"));
      },
    );

    /**
     * Kill the current session
     */
    this.app.post(
      "/logout",
      authRateLimiter(),
      (req: Request, res: Response, _next: NextFunction) => {
        req.session.destroy((err: Error) => {
          if (err) throw err;
          res.status(204).end();
        });
      },
    );

    /**
     * Let the user request a new password by supplying her email
     */
    this.app.post(
      "/auth/reset-password",
      authRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const response = (await this.kernel.handle(
          createRPCPayload("user:forgottenPassword", { email: req.body.email }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end check an email/password couple for password recovery
     */
    this.app.post(
      "/auth/check-token",
      authRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const response = (await this.kernel.handle(
          createRPCPayload("user:checkForgottenToken", {
            email: req.body.email,
            token: req.body.token,
          }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the user change her password by supplying an email, a token and a new password
     */
    this.app.post(
      "/auth/change-password",
      authRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const response = (await this.kernel.handle(
          createRPCPayload("user:changePasswordWithToken", {
            email: req.body.email,
            token: req.body.token,
            password: req.body.password,
          }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end confirm a pending email with an email and a token
     */
    this.app.post(
      "/auth/confirm-email",
      authRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const response = (await this.kernel.handle(
          createRPCPayload("user:confirmEmail", {
            email: req.body.email,
            token: req.body.token,
          }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );
  }

  private registerApplicationRoutes(): void {
    /**
     * Create an application
     */
    this.app.post(
      "/applications",
      rateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        if (Array.isArray(req.body)) {
          throw new InvalidRequestException(
            "Cannot create multiple applications at once",
          );
        }

        const user = get(req, "session.user", null);
        if (!user) throw new UnauthorizedException();
        if (!user.operator_id) {
          throw new UnauthorizedException(
            "Only operators can create applications",
          );
        }

        const response = (await this.kernel.handle(
          createRPCPayload("application:create", { name: req.body.name }, user),
        )) as RPCResponseType;

        if ("error" in (response as any)) {
          return this.send(res, response);
        }

        const application = (response as any).result;

        const token = await this.tokenProvider.sign<TokenPayloadInterface>({
          a: application.uuid,
          o: application.owner_id,
          s: application.owner_service,
          p: application.permissions,
          v: 2,
        });

        res.status(201).json({ application, token });
      }),
    );
  }

  private registerCertificateRoutes(): void {
    /**
     * v3 Public route for operators to generate a certificate
     * based on params (identity, start date, end date, ...)
     * - accessible with an application token
     * - generate a certificate to be printed when calling /certificates/{uuid}/attachment
     */
    registerExpressRoute(this.app, this.kernel, {
      path: "/certificates",
      action: "certificate:create",
      method: "POST",
      successHttpCode: 201,
    });

    /**
     * v3 Download PDF of the certificate
     * - accessible with an application token
     * - print a PDF returned back to the caller
     */
    registerExpressRoute(this.app, this.kernel, {
      path: "/certificates/:uuid/attachment",
      action: "certificate:download",
      method: "POST",
      async responseFn(response, result) {
        const { headers, body } = result as DownloadCertificateResultInterface;
        for (const header of Object.keys(headers)) {
          response.set(header, headers[header]);
        }
        response.send(body);
      },
    });

    /**
     * v3 Public route to retrieve a certificate
     */
    registerExpressRoute(this.app, this.kernel, {
      path: "/certificates/:uuid",
      action: "certificate:find",
      method: "GET",
      rpcAnswerOnFailure: true,
      rpcAnswerOnSuccess: true,
    });
  }

  private registerAfterAllHandlers(): void {
    // add the RPC method as tag
    this.app.use(
      (error: Error, req: Request, _res: Response, next: NextFunction) => {
        const body = Array.isArray(req.body) ? req.body[0] : req.body;
        if (body) Sentry.setTag("method", get(body, "method", "not set"));

        next(error);
      },
    );

    Sentry.setupExpressErrorHandler(this.app);

    // general error handler
    // keep last
    this.app.use(errorHandlerMiddleware);
  }

  private registerHonorRoutes() {
    /**
     * Save a hit to the generated certificate (public or private sector)
     * 201 Response has a 'Location' header redirecting to the public stats page.
     * https://tools.ietf.org/html/rfc7231#section-6.3.2
     *
     * Rate limiter is pretty low as few certificates should be generated by IP per minute.
     * CORS policy is specific to this route
     */
    this.app.post(
      "/honor",
      monHonorCertificateRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        await this.kernel.handle(
          createRPCPayload(
            "honor:save",
            { type: req.body.type, employer: req.body.employer },
            { permissions: ["common.honor.save"] },
          ),
        );
        res.status(201).header(
          "Location",
          `${env_or_fail("APP_APP_URL")}/honor/stats`,
        ).json({ saved: true });
      }),
    );

    /**
     * Expose stats publicly
     */
    this.app.get(
      "/honor/stats",
      rateLimiter(),
      asyncHandler(
        async (_req: Request, res: Response, _next: NextFunction) => {
          const response = await this.kernel.handle(
            createRPCPayload("honor:stats", {}, {
              permissions: ["common.honor.stats"],
            }),
          );
          this.send(res, response as RPCResponseType);
        },
      ),
    );
  }

  private registerDashboardRoutes() {
    const routes: Array<RouteParams> = [
      {
        path: "/dashboard/operators/month",
        action: "dashboard:operatorsByMonth",
        method: "GET",
      },
      {
        path: "/dashboard/operators/day",
        action: "dashboard:operatorsByDay",
        method: "GET",
      },
      {
        path: "/dashboard/incentive/month",
        action: "dashboard:incentiveByMonth",
        method: "GET",
      },
      {
        path: "/dashboard/incentive/day",
        action: "dashboard:incentiveByDay",
        method: "GET",
      },
      {
        path: "/dashboard/campaigns",
        action: "dashboard:campaigns",
        method: "GET",
      },
    ];
    routes.map((c) => registerExpressRoute(this.app, this.kernel, c));
  }

  private registerObservatoryRoutes() {
    type ObservatoryMethod = string;
    type ObservatoryURL = string;

    const routes: Map<ObservatoryMethod, ObservatoryURL> = new Map(
      Object.entries({
        getKeyfigures: "keyfigures",
        getFlux: "flux",
        getEvolFlux: "evol-flux",
        getBestFlux: "best-flux",
        getOccupation: "occupation",
        getEvolOccupation: "evol-occupation",
        getBestTerritories: "best-territories",
        journeysByHours: "journeys-by-hours",
        journeysByDistances: "journeys-by-distances",
        getLocation: "location",
        airesCovoiturage: "aires-covoiturage",
        campaigns: "campaigns",
        getIncentive: "incentive",
      }),
    );

    for (const [obsMethod, obsUrl] of routes) {
      this.app.get(
        `/observatory/${obsUrl}`,
        rateLimiter(),
        this.cache.set({ prefix: "observatory", ttl: CacheTTL.MONTH }),
        asyncHandler(async (req: Request, res: Response) => {
          const response = await this.kernel.handle(
            createRPCPayload(`observatory:${obsMethod}`, req.query, {
              permissions: ["common.observatory.stats"],
            }),
          );
          this.send(res, response as RPCResponseType);
        }),
      );
    }
  }

  /**
   * Used by showcase website's contact form.
   * Gets data and sends it by email
   */
  private registerContactformRoute() {
    this.app.post(
      "/contactform",
      contactformRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const { name, email, company, job, subject, body } = req.body;
        const response = await this.kernel.handle(
          createRPCPayload(
            "user:contactform",
            { name, email, company, job, subject, body },
            { permissions: ["common.user.contactform"] },
          ),
        );

        this.send(res, response as RPCResponseType);
      }),
    );
  }

  /**
   * Serve static files
   * Files must be copied to dist/public folder
   */
  private registerStaticFolder() {
    const __dirname = new URL(".", import.meta.url).pathname;
    logger.debug(
      `registerStaticFolder: ${join(__dirname, "public/.well-known")}`,
    );
    this.app.use(
      "/.well-known",
      express.static(join(__dirname, "public/.well-known")),
    );
  }

  /**
   * Calls to the /rpc endpoint
   */
  private registerCallHandler(): void {
    const endpoint = this.config.get("proxy.rpc.endpoint");

    /**
     * List all RPC actions
     * - disabled when deployed
     */
    if (env_or_fail("APP_ENV", "local") === "local") {
      this.app.get(
        endpoint,
        rateLimiter(),
        asyncHandler(
          async (_req: Request, res: Response, _next: NextFunction) => {
            const response = await this.kernel
              .getContainer()
              .getHandlers()
              .map((def) => ({
                service: def.service,
                method: def.method,
              }))
              .reduce((acc: string[], { service, method }) => {
                acc.push(`${service}:${method}`);
                return acc;
              }, []);
            res.json(response);
          },
        ),
      );
    }

    // register the POST route to /rpc
    this.app.post(
      endpoint,
      apiRateLimiter(),
      asyncHandler(
        async (
          req: Request,
          res: Response,
          _next: NextFunction,
        ): Promise<void> => {
          // if (req.originalUrl === "/rpc?methods=trip:stats") {
          //   res.setTimeout(120000);
          // }
          // inject the req.session.user to context in the body
          const isBatch = Array.isArray(req.body);
          let user = get(req, "session.user", null);

          if (!user) {
            throw new UnauthorizedException();
          }

          user = { ...user, ...(await this.getTerritoryInfos(user)) };
          // nest the params and _context and inject the session user
          // from { id: 1, jsonrpc: '2.0', method: 'a:b' params: {} }
          // to { id: 1, jsonrpc: '2.0', method: 'a:b' params: { params: {}, _context: {} } }
          req.body = isBatch
            ? req.body.map((doc: RPCSingleCallType) => injectContext(doc, user))
            : injectContext(req.body, user);

          // pass the request to the kernel
          const response = (await this.kernel.handle(req.body)) as RPCResponseType;

          // send the response
          this.send(res, response);
        },
      ),
    );
  }

  private start(port = 8080, _timeout = 30000): void {
    this.server = this.app.listen(
      port,
      () =>
        logger.info(
          `Listening on port ${port}. Version ${this.config.get("sentry.version")}`,
        ),
    );
    // FIXME
    // this.server.setTimeout(_timeout);
  }

  /**
   * Send the response to the client
   * - set optional headers
   * - set the status code (converted from an RPC status code)
   * - set the body. Error patterns are parsed
   */
  public send(
    res: Response,
    response: RPCResponseType,
    headers: { [key: string]: string } = {},
    unnestResult = false,
  ): void {
    if ("success" in (response as Response)) {
      this.setHeaders(res, headers);
    }

    // get the HTTP status code from response meta or convert RPC code
    const status = get(
      response,
      "result.meta.httpStatus",
      mapStatusCode(response),
    );

    res.status(status).json(this.parseErrorData(response, unnestResult));
  }

  /**
   * add non-null headers on successful responses
   */
  private setHeaders(
    res: Response,
    headers: { [key: string]: string } = {},
  ): void {
    Object.keys(headers).forEach((k: string) => {
      if (typeof headers[k] === "string") {
        res.set(k, headers[k]);
      }
    });
  }

  /**
   * Parse JSON payloads passed to the error.data object
   * clean up data key to avoid leaks and reduce size
   */
  private parseErrorData(
    response: Response,
    unnestResult = false,
  ): RPCResponseType {
    if (!("error" in response) || !("data" in response.error)) {
      return unnestResult ? response.result : response;
    }
    if (typeof response.error.data !== "string") return response;

    try {
      const parsed = JSON.parse(response.error.data);
      const cleaned = (Array.isArray(parsed) ? parsed : [parsed]).map((d) => {
        delete d.data;
        return d;
      });

      response.error.data = cleaned;
    } catch {}

    return response;
  }

  /**
   * Fetch additional data for territories
   */
  private async getTerritoryInfos(user: any): Promise<any> {
    if (user.territory_id) {
      const dt = { com: [] } as { com: string[] };

      try {
        const authorizedCodes = await this.kernel.call<
          GetAuthorizedCodesParams,
          GetAuthorizedCodesResult
        >(
          getAuthorizedCodesSignature,
          { _id: user.territory_id },
          { call: { user }, channel: { service: "proxy" } },
        );

        dt.com = authorizedCodes.com || [];
      } catch (e) {}

      user.authorizedZoneCodes = { ...dt };

      return user;
    }

    return {};
  }
}
