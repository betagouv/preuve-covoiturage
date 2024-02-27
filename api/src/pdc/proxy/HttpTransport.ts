import {
  ConfigInterface,
  ConfigInterfaceResolver,
  InvalidRequestException,
  KernelInterface,
  RPCSingleCallType,
  TransportInterface,
  UnauthorizedException,
} from '@ilos/common';
import { env } from '@ilos/core';
import { mapStatusCode } from '@ilos/transport-http';
import { Sentry, SentryProvider } from '@pdc/providers/sentry';
import { TokenProviderInterfaceResolver } from '@pdc/providers/token';
import bodyParser from 'body-parser';
import createStore from 'connect-redis';
import cors from 'cors';
import express, { Request, Response } from 'express';
import expressSession from 'express-session';
import helmet from 'helmet';
import http from 'http';
import Redis from 'ioredis';
import { get, pick } from 'lodash';
import { asyncHandler } from './helpers/asyncHandler';
import { createRPCPayload } from './helpers/createRPCPayload';
import { healthCheckFactory } from './helpers/healthCheckFactory';
import { injectContext } from './helpers/injectContext';
import { prometheusMetricsFactory } from './helpers/prometheusMetricsFactory';
import { dataWrapMiddleware, errorHandlerMiddleware, signResponseMiddleware } from './middlewares';
import {
  acquisitionRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  ceeRateLimiter,
  checkRateLimiter,
  contactformRateLimiter,
  loginRateLimiter,
  monHonorCertificateRateLimiter,
  rateLimiter,
} from './middlewares/rateLimiter';
import { serverTokenMiddleware } from './middlewares/serverTokenMiddleware';
import { TokenPayloadInterface } from '@shared/application/common/interfaces/TokenPayloadInterface';
import { RPCResponseType } from '@shared/common/rpc/RPCResponseType';
import {
  ParamsInterface as GetAuthorizedCodesParams,
  ResultInterface as GetAuthorizedCodesResult,
  signature as getAuthorizedCodesSignature,
} from '@shared/territory/getAuthorizedCodes.contract';

import { CacheMiddleware, CacheTTL, cacheMiddleware } from './middlewares/cacheMiddleware';
import { metricsMiddleware } from './middlewares/metricsMiddleware';
import { signature as importCeeSignature } from '@shared/cee/importApplication.contract';
import { signature as importIdentityCeeSignature } from '@shared/cee/importApplicationIdentity.contract';
import { signature as registerCeeSignature } from '@shared/cee/registerApplication.contract';
import { signature as simulateCeeSignature } from '@shared/cee/simulateApplication.contract';
import path from 'node:path';

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
    const port = optsPort || optsPort === 0 ? optsPort : this.config.get('proxy.port', 8080);

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
    this.registerObservatoryRoutes();
    this.registerContactformRoute();
    this.registerCallHandler();
    this.registerAfterAllHandlers();
    this.registerGeoRoutes();
    this.registerStaticFolder();
  }

  getApp(): express.Express {
    return this.app;
  }

  private async getProviders(): Promise<void> {
    this.config = this.kernel.getContainer().get(ConfigInterfaceResolver);
    this.tokenProvider = this.kernel.getContainer().get(TokenProviderInterfaceResolver);
  }

  private registerBeforeAllHandlers(): void {
    this.kernel.getContainer().get(SentryProvider);
    this.app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
    Sentry.setTag('transport', 'http');
    Sentry.setTag('version', this.config.get('sentry.version'));
  }

  private registerBodyHandler(): void {
    this.app.use(bodyParser.json({ limit: '2mb' }));
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private registerSessionHandler(): void {
    // needed for reverse-proxy compatibility
    // must be set before configuring the session
    this.app.set('trust proxy', 1);

    const sessionSecret = this.config.get('proxy.session.secret');
    const sessionName = this.config.get('proxy.session.name');
    const redisConfig = this.config.get('connections.redis');
    const redis = new Redis(redisConfig);
    const redisStore = createStore(expressSession);

    const sessionMiddleware = expressSession({
      cookie: {
        path: '/',
        httpOnly: true,
        maxAge: this.config.get('proxy.session.maxAge'),
        // https everywhere but in local development
        secure: env.or_fail('APP_ENV', 'local') !== 'local',
        sameSite: env.or_fail('APP_ENV', 'local') !== 'local' ? 'none' : 'strict',
      },

      name: sessionName,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new redisStore({ client: redis, keyPrefix: 'proxy:' }),
    });

    this.app.use(function (req, res, next) {
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
        origin: this.config.get('proxy.cors'),
        optionsSuccessStatus: 200,
        // Allow-Access-Credentials lets XHR requests send Cookies to a different URL
        credentials: true,
      }),
    );

    this.app.use(
      /\/(observatory|geo\/search)/i,
      cors({
        origin: this.config.get('proxy.observatoryCors'),
        optionsSuccessStatus: 200,
      }),
    );

    // apply specific cors policy
    this.app.use(
      '/honor',
      cors({
        origin: this.config.get('proxy.certUrl'),
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      '/contactform',
      cors({
        origin: this.config.get('proxy.showcase'),
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      '/geo/search',
      cors({
        origin: this.config.get('proxy.showcase'),
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      '/policy/simulate',
      cors({
        origin: this.config.get('proxy.showcase'),
        optionsSuccessStatus: 200,
      }),
    );
  }

  private registerGlobalMiddlewares(): void {
    // maintenance mode
    this.app.use((req, res, next) => {
      if (env.or_false('APP_MAINTENANCE')) {
        res.status(503).json({ code: 503, error: 'Service Unavailable' });
        return;
      }

      next();
    });

    this.app.use(signResponseMiddleware);
    this.app.use(dataWrapMiddleware);
  }

  private registerCache(): void {
    // create Redis connection only when the cache is enabled
    const enabled = this.config.get('cache.enabled');
    const gzipped = this.config.get('cache.gzipped');
    const authToken = this.config.get('cache.authToken');
    const driver = enabled ? new Redis(this.config.get('connections.redis')) : null;
    this.cache = cacheMiddleware({ enabled, driver, gzipped, authToken });

    this.app.delete(
      '/cache',
      rateLimiter(),
      this.cache.auth(),
      asyncHandler(async (req: Request, res: Response) => {
        const prefix = (req.query.prefix as string | undefined) || '*';
        const result = await this.cache.flush(prefix);
        res.status(200).json({ id: 1, jsonrpc: '2.0', result });
      }),
    );
  }

  private registerMetrics(): void {
    this.app.get('/health', metricsMiddleware('health'), healthCheckFactory([]));
    this.app.get('/metrics', metricsMiddleware('metrics'), prometheusMetricsFactory());
  }

  private registerCeeRoutes(): void {
    this.app.post(
      '/v3/policies/cee',
      ceeRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        Sentry.setUser(
          pick(user, ['_id', 'application_id', 'operator_id', 'territory_id', 'permissions', 'role', 'status']),
        );

        const response = (await this.kernel.handle(
          createRPCPayload(registerCeeSignature, { ...req.body }, user, { req }),
        )) as RPCResponseType;

        if (!response || 'error' in response || !('result' in response)) {
          res.status(mapStatusCode(response)).json(response.error?.data || { message: response.error?.message });
        } else {
          res.status(201).json(response.result);
        }
      }),
    );

    this.app.post(
      '/v3/policies/cee/simulate',
      ceeRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        Sentry.setUser(
          pick(user, ['_id', 'application_id', 'operator_id', 'territory_id', 'permissions', 'role', 'status']),
        );

        const response = (await this.kernel.handle(
          createRPCPayload(simulateCeeSignature, { ...req.body }, user, { req }),
        )) as RPCResponseType;
        if (!response || 'error' in response || !('result' in response)) {
          res.status(mapStatusCode(response)).json(response.error?.data || { message: response.error?.message });
        } else {
          res.status(200).end();
        }
      }),
    );

    this.app.post(
      '/v3/policies/cee/import',
      ceeRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        Sentry.setUser(
          pick(user, ['_id', 'application_id', 'operator_id', 'territory_id', 'permissions', 'role', 'status']),
        );

        const response = (await this.kernel.handle(
          createRPCPayload(importCeeSignature, req.body, user, { req }),
        )) as RPCResponseType;
        if (!response || 'error' in response || !('result' in response)) {
          res.status(mapStatusCode(response)).json(response.error?.data || { message: response.error?.message });
        } else {
          res.status(201).json(response.result);
        }
      }),
    );

    this.app.post(
      '/v3/policies/cee/import/identity',
      ceeRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        Sentry.setUser(
          pick(user, ['_id', 'application_id', 'operator_id', 'territory_id', 'permissions', 'role', 'status']),
        );

        const response = (await this.kernel.handle(
          createRPCPayload(importIdentityCeeSignature, req.body, user, { req }),
        )) as RPCResponseType;
        if (!response || 'error' in response || !('result' in response)) {
          res.status(mapStatusCode(response)).json(response.error?.data || { message: response.error?.message });
        } else {
          res.status(200).json(response.result);
        }
      }),
    );
  }

  private registerSimulationRoutes(): void {
    this.app.post(
      '/v3/policies/simulate',
      rateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload('campaign:simulateOnFuture', { api_version: req.params.version, ...req.body }, user, {
            req,
          }),
        )) as RPCResponseType;
        this.send(res, response);
      }),
    );
    this.app.post(
      '/policy/simulate',
      rateLimiter({ max: 1 }, 'rl-policy-simulate'),
      asyncHandler(async (req, res, next) => {
        this.kernel.notify('user:sendSimulationEmail', req.body, {
          call: { user: { permissions: ['common.user.policySimulate'] } },
          channel: {
            service: 'proxy',
          },
        });
        this.send(res, { id: 1, jsonrpc: '2.0' });
      }),
    );
  }

  private registerGeoRoutes(): void {
    this.app.post(
      '/geo/search',
      rateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.handle(
          createRPCPayload(
            'territory:listGeo',
            { search: req.body.search, exclude_coms: req.body.exclude_coms },
            { permissions: ['common.territory.list'] },
          ),
        );
        this.send(res, response as RPCResponseType);
      }),
    );

    this.app.get(
      '/v3/geo/route',
      checkRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload('geo:getRouteMeta', req.query, user, { req }),
        )) as RPCResponseType;
        this.send(res, response, {}, true);
      }),
    );

    this.app.get(
      '/v3/geo/point/by_address',
      checkRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload('geo:getPointByAddress', req.query, user, { req }),
        )) as RPCResponseType;
        this.send(res, response, {}, true);
      }),
    );

    this.app.get(
      '/v3/geo/point/by_insee',
      checkRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload('geo:getPointByCode', req.query, user, { req }),
        )) as RPCResponseType;
        this.send(res, response, {}, true);
      }),
    );
  }

  /**
   * Journeys routes
   * - check status
   * - invalidate
   * - save
   */
  private registerAcquisitionRoutes(): void {
    this.app.get(
      '/v3/journeys/:operator_journey_id',
      checkRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const { params } = req;
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload('acquisition:status', params, user, { req }),
        )) as RPCResponseType;
        this.send(res, response, {}, true);
      }),
    );

    this.app.patch(
      '/v3/journeys/:operator_journey_id',
      checkRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload(
            'acquisition:patch',
            { operator_journey_id: req.params.operator_journey_id, ...req.body },
            user,
            { req },
          ),
        )) as RPCResponseType;
        this.send(res, response, {});
      }),
    );

    this.app.post(
      '/v3/journeys/:id/cancel',
      rateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const response = (await this.kernel.handle(
          createRPCPayload(
            'acquisition:cancel',
            {
              ...req.body,
              operator_journey_id: req.params.id,
              api_version: 'v3',
            },
            user,
            { req },
          ),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    // send a journey
    this.app.post(
      '/v3/journeys',
      acquisitionRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});

        Sentry.setUser(
          pick(user, ['_id', 'application_id', 'operator_id', 'territory_id', 'permissions', 'role', 'status']),
        );

        const response = (await this.kernel.handle(
          createRPCPayload('acquisition:create', { api_version: 'v3', ...req.body }, user, { req }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    this.app.get(
      '/v3/journeys',
      checkRateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const { query } = req;
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          createRPCPayload('acquisition:list', query, user, { req }),
        )) as RPCResponseType;
        this.send(res, response, {}, true);
      }),
    );
  }

  private registerAuthRoutes(): void {
    /**
     * Log the user in based on email and password combination
     */
    this.app.post(
      '/login',
      loginRateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(createRPCPayload('user:login', req.body))) as RPCResponseType;

        if (!response || Array.isArray(response) || 'error' in response) {
          res.status(mapStatusCode(response)).json(this.parseErrorData(response));
        } else {
          const user = Array.isArray(response) ? response[0].result : response.result;
          req.session.user = { ...user, ...(await this.getTerritoryInfos(user)) };

          this.send(res, response);
        }
      }),
    );

    /**
     * Get the user profile (reads from the session rather than the database)
     */
    this.app.get('/profile', authRateLimiter(), (req, res, next) => {
      if (!('user' in req.session)) {
        throw new UnauthorizedException();
      }

      res.json(get(req.session, 'user'));
    });

    /**
     * Kill the current sesssion
     */
    this.app.post('/logout', authRateLimiter(), (req, res, next) => {
      req.session.destroy((err) => {
        if (err) {
          throw new Error(err.message);
        }
        res.status(204).end();
      });
    });

    /**
     * Let the user request a new password by supplying her email
     */
    this.app.post(
      '/auth/reset-password',
      authRateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          createRPCPayload('user:forgottenPassword', { email: req.body.email }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end check an email/password couple for password recovery
     */
    this.app.post(
      '/auth/check-token',
      authRateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          createRPCPayload('user:checkForgottenToken', { email: req.body.email, token: req.body.token }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the user change her password by supplying an email, a token and a new password
     */
    this.app.post(
      '/auth/change-password',
      authRateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          createRPCPayload('user:changePasswordWithToken', {
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
      '/auth/confirm-email',
      authRateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          createRPCPayload('user:confirmEmail', { email: req.body.email, token: req.body.token }),
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
      '/applications',
      rateLimiter(),
      asyncHandler(async (req, res, next) => {
        if (Array.isArray(req.body)) {
          throw new InvalidRequestException('Cannot create multiple applications at once');
        }

        const user = get(req, 'session.user', null);
        if (!user) throw new UnauthorizedException();
        if (!user.operator_id) throw new UnauthorizedException('Only operators can create applications');

        const response = (await this.kernel.handle(
          createRPCPayload('application:create', { name: req.body.name }, user),
        )) as RPCResponseType;

        if ('error' in (response as any)) {
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
     * - generate a certificate to be printed when calling /v3/certificates/{uuid}/attachment
     */
    this.app.post(
      '/v3/certificates',
      rateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const call = createRPCPayload('certificate:create', req.body, get(req, 'session.user', undefined));
        const response = (await this.kernel.handle(call)) as RPCResponseType;
        res
          .status(get(response, 'result.meta.httpStatus', mapStatusCode(response)))
          .send(get(response, 'result.data', this.parseErrorData(response)));
      }),
    );

    /**
     * v3 Download PDF of the certificate
     * - accessible with an application token
     * - print a PDF returned back to the caller
     */
    this.app.post(
      '/v3/certificates/:uuid/attachment',
      rateLimiter(),
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const call = createRPCPayload(
          'certificate:download',
          { ...req.body, uuid: req.params.uuid },
          get(req, 'session.user', undefined),
        );
        const response = (await this.kernel.handle(call)) as RPCResponseType;

        this.raw(res, get(response, 'result.body', response), get(response, 'result.headers', {}));
      }),
    );

    /**
     * v3 Public route to retrieve a certificate
     */
    this.app.get(
      '/v3/certificates/:uuid',
      rateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          createRPCPayload('certificate:find', { uuid: req.params.uuid }, { permissions: ['common.certificate.find'] }),
        )) as RPCResponseType;

        this.raw(res, get(response, 'result.data', response), { 'Content-type': 'application/json' });
      }),
    );
  }

  private registerAfterAllHandlers(): void {
    // add the RPC method as tag
    this.app.use((error, req, res, next) => {
      const body = Array.isArray(req.body) ? req.body[0] : req.body;
      if (body) Sentry.setTag('method', get(body, 'method', 'not set'));

      next(error);
    });

    this.app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

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
      '/honor',
      monHonorCertificateRateLimiter(),
      asyncHandler(async (req, res, next) => {
        await this.kernel.handle(
          createRPCPayload(
            'honor:save',
            { type: req.body.type, employer: req.body.employer },
            { permissions: ['common.honor.save'] },
          ),
        );
        res.status(201).header('Location', `${process.env.APP_APP_URL}/honor/stats`).json({ saved: true });
      }),
    );

    /**
     * Expose stats publicly
     */
    this.app.get(
      '/honor/stats',
      rateLimiter(),
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.handle(
          createRPCPayload('honor:stats', {}, { permissions: ['common.honor.stats'] }),
        );
        this.send(res, response as RPCResponseType);
      }),
    );
  }

  private registerObservatoryRoutes() {
    type ObservatoryMethod = string;
    type ObservatoryURL = string;

    const routes: Map<ObservatoryMethod, ObservatoryURL> = new Map(
      Object.entries({
        monthlyKeyfigures: 'monthly-keyfigures',
        monthlyFlux: 'monthly-flux',
        evolMonthlyFlux: 'evol-monthly-flux',
        bestMonthlyFlux: 'best-monthly-flux',
        lastRecordMonthlyFlux: 'monthly-flux/last',
        monthlyOccupation: 'monthly-occupation',
        evolMonthlyOccupation: 'evol-monthly-occupation',
        bestMonthlyTerritories: 'best-monthly-territories',
        territoriesList: 'territories',
        territoryName: 'territory',
        journeysByHours: 'journeys-by-hours',
        journeysByDistances: 'journeys-by-distances',
        getLocation: 'location',
        airesCovoiturage: 'aires-covoiturage',
      }),
    );

    for (const [obsMethod, obsUrl] of routes) {
      this.app.get(
        `/observatory/${obsUrl}`,
        rateLimiter(),
        this.cache.set({ prefix: 'observatory', ttl: CacheTTL.MONTH }),
        asyncHandler(async (req: Request, res: Response) => {
          const response = await this.kernel.handle(
            createRPCPayload(`observatory:${obsMethod}`, req.query, { permissions: ['common.observatory.stats'] }),
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
      '/contactform',
      contactformRateLimiter(),
      asyncHandler(async (req, res, next) => {
        const { name, email, company, job, subject, body } = req.body;
        const response = await this.kernel.handle(
          createRPCPayload(
            'user:contactform',
            { name, email, company, job, subject, body },
            { permissions: ['common.user.contactform'] },
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
    console.debug(`registerStaticFolder: ${path.join(__dirname, 'public/.well-known')}`);
    this.app.use('/.well-known', express.static(path.join(__dirname, 'public/.well-known')));
  }

  /**
   * Calls to the /rpc endpoint
   */
  private registerCallHandler(): void {
    const endpoint = this.config.get('proxy.rpc.endpoint');

    /**
     * List all RPC actions
     * - disabled when deployed
     */
    if (env.or_fail('APP_ENV', 'local') === 'local') {
      this.app.get(
        endpoint,
        rateLimiter(),
        asyncHandler(async (req, res, next) => {
          const response = await this.kernel
            .getContainer()
            .getHandlers()
            .map((def) => ({
              service: def.service,
              method: def.method,
            }))
            .reduce((acc, { service, method }) => {
              acc.push(`${service}:${method}`);
              return acc;
            }, []);
          res.json(response);
        }),
      );
    }

    // register the POST route to /rpc
    this.app.post(
      endpoint,
      apiRateLimiter(),
      asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
        if (req.originalUrl === '/rpc?methods=trip:stats') {
          res.setTimeout(120000);
        }
        // inject the req.session.user to context in the body
        const isBatch = Array.isArray(req.body);
        let user = get(req, 'session.user', null);

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
      }),
    );
  }

  private start(port = 8080, timeout = 30000): void {
    this.server = this.app.listen(port, () =>
      console.info(`Listening on port ${port}. Version ${this.config.get('sentry.version')}`),
    );

    this.server.setTimeout(timeout);
  }

  /**
   * Send the response to the client
   * - set optional headers
   * - set the status code (converted from an RPC status code)
   * - set the body. Error patterns are parsed
   */
  private send(
    res: Response,
    response: RPCResponseType,
    headers: { [key: string]: string } = {},
    unnestResult = false,
  ): void {
    if ('success' in (response as any)) {
      this.setHeaders(res, headers);
    }

    // get the HTTP status code from response meta or convert RPC code
    const status = get(response, 'result.meta.httpStatus', mapStatusCode(response));

    res.status(status).json(this.parseErrorData(response, unnestResult));
  }

  /**
   * Send raw response data with configured headers
   */
  private raw(res: Response, data: any, headers: { [key: string]: string } = {}): void {
    if (typeof data === 'object' && 'error' in data) {
      res.status(mapStatusCode(data));
      res.send(data.error);
      return;
    }

    this.setHeaders(res, headers);
    res.send(data);
  }

  /**
   * add non-null headers on successful responses
   */
  private setHeaders(res: Response, headers: { [key: string]: string } = {}): void {
    Object.keys(headers).forEach((k: string) => {
      if (typeof headers[k] === 'string') {
        res.set(k, headers[k]);
      }
    });
  }

  /**
   * Parse JSON payloads passed to the error.data object
   * clean up data key to avoid leaks and reduce size
   */
  private parseErrorData(response, unnestResult = false): RPCResponseType {
    if (!('error' in response) || !('data' in response.error)) return unnestResult ? response.result : response;
    if (typeof response.error.data !== 'string') return response;

    try {
      const parsed = JSON.parse(response.error.data);
      const cleaned = (Array.isArray(parsed) ? parsed : [parsed]).map((d) => {
        delete d.data;
        return d;
      });

      response.error.data = cleaned;
    } catch (e) {}

    return response;
  }

  /**
   * Fetch additional data for territories
   */
  private async getTerritoryInfos(user): Promise<any> {
    if (user.territory_id) {
      const dt = {
        com: [],
      };

      try {
        const authorizedCodes = await this.kernel.call<GetAuthorizedCodesParams, GetAuthorizedCodesResult>(
          getAuthorizedCodesSignature,
          { _id: user.territory_id },
          { call: { user }, channel: { service: 'proxy' } },
        );

        dt.com = authorizedCodes.com || [];
      } catch (e) {}

      user.authorizedZoneCodes = { ...dt };

      return user;
    }

    return {};
  }
}
