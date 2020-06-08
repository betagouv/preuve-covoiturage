import http from 'http';
import express, { Response } from 'express';
import expressSession from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { get } from 'lodash';
import Redis from 'ioredis';
import createStore from 'connect-redis';
import {
  TransportInterface,
  KernelInterface,
  ConfigInterface,
  ConfigInterfaceResolver,
  RPCSingleCallType,
  UnauthorizedException,
  InvalidRequestException,
} from '@ilos/common';
import { env } from '@ilos/core';
import { Sentry, SentryProvider } from '@pdc/provider-sentry';
import { mapStatusCode } from '@ilos/transport-http';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

import { dataWrapMiddleware, signResponseMiddleware, errorHandlerMiddleware } from './middlewares';
import { asyncHandler } from './helpers/asyncHandler';
import { makeCall } from './helpers/routeMapping';
import { nestParams } from './helpers/nestParams';
import { serverTokenMiddleware } from './middlewares/serverTokenMiddleware';
import { RPCResponseType } from './shared/common/rpc/RPCResponseType';
import { TokenPayloadInterface } from './shared/application/common/interfaces/TokenPayloadInterface';

export class HttpTransport implements TransportInterface {
  app: express.Express;
  config: ConfigInterface;
  port: string;
  server: http.Server;
  tokenProvider: TokenProviderInterfaceResolver;

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
    this.registerGlobalMiddlewares();
    this.registerStatsRoutes();
    this.registerAuthRoutes();
    this.registerApplicationRoutes();
    this.registerCertificateRoutes();
    this.registerAcquisitionRoutes();
    this.registerCallHandler();
    this.registerAfterAllHandlers();
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
    this.app.use(Sentry.Handlers.requestHandler());
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
    const redis = new Redis(this.config.get('redis.connectionString'), { keyPrefix: 'proxy:' });
    const redisStore = createStore(expressSession);

    this.app.use(
      expressSession({
        cookie: {
          path: '/',
          httpOnly: true,
          maxAge: this.config.get('proxy.session.maxAge'),
          // https everywhere but in local development
          secure: env('APP_ENV', 'local') !== 'local',
          sameSite: 'none',
        },
        name: sessionName,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new redisStore({ client: redis }),
      }),
    );
  }

  private registerSecurity(): void {
    // protect with typical headers and enable cors
    this.app.use(helmet());

    // set CORS with the Application URL
    const corsOrigin = this.config.get('proxy.cors');

    this.app.use(
      cors({
        origin: corsOrigin,
        optionsSuccessStatus: 200,
        // Allow-Access-Credentials lets XHR requests send Cookies to a different URL
        credentials: true,
      }),
    );
  }

  private registerGlobalMiddlewares(): void {
    this.app.use(signResponseMiddleware);
    this.app.use(dataWrapMiddleware);
  }

  /**
   * Operators POST to /journeys/push
   * being authenticated by a JWT long-lived token with the payload:
   * {
   *    a: string,
   *    o: string,
   *    p: [string],
   *    v: number
   * }
   */
  private registerAcquisitionRoutes(): void {
    // V1 payload
    this.app.post(
      '/journeys/push',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const isLatest =
          Array.isArray(get(req, 'body.passenger.incentives', null)) ||
          Array.isArray(get(req, 'body.driver.incentives', null));

        /**
         * Throw a Bad Request error and give information to the user
         * about the version mismatch
         */
        if (isLatest) {
          res.status(400).json({
            id: req.body.id,
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Invalid Request',
              data: 'Please use /v2/journeys endpoint for Schema V2',
            },
          });

          return;
        }

        const response = await this.kernel.handle(
          makeCall('acquisition:createLegacy', req.body, { user, metadata: { req } }),
        );

        // warn the user about this endpoint deprecation agenda
        // https://github.com/betagouv/preuve-covoiturage/issues/383
        // prettier-ignore
        // eslint-disable-next-line
        const warning = 'The POST /journeys/push route will be deprecated at the end of 2019. Please use POST /v2/journeys instead.  Please migrate to the new journey schema. Documentation: https://hackmd.io/@jonathanfallon/HyXkGqxOH';

        res.status(mapStatusCode(response)).json({
          meta: {
            warning,
            supported_until: '2020-01-01T00:00:00Z',
          },
          data: this.parseErrorData(response),
        });
      }),
    );

    // check journey status
    this.app.get(
      '/v2/journeys/:journey_id',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const { params } = req;
        const user = get(req, 'session.user', null);
        const response = (await this.kernel.handle(
          makeCall('acquisition:status', params, { user, metadata: { req } }),
        )) as RPCResponseType;
        this.send(res, response);
      }),
    );

    // cancel existing journey
    this.app.delete(
      '/v2/journeys/:id',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const response = (await this.kernel.handle(
          makeCall(
            'acquisition:cancel',
            {
              ...req.body,
              journey_id: parseInt(req.params.id, 10),
            },
            { user, metadata: { req } },
          ),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );

    // send a journey
    this.app.post(
      '/v2/journeys',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const response = (await this.kernel.handle(
          makeCall('acquisition:create', req.body, { user, metadata: { req } }),
        )) as RPCResponseType;

        this.send(res, response);
      }),
    );
  }

  private registerStatsRoutes(): void {
    this.app.get(
      '/stats',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          makeCall('trip:stats', {}, { user: { permissions: ['trip.stats'] } }),
        )) as RPCResponseType;

        if (!response || Array.isArray(response) || 'error' in response) {
          res.status(mapStatusCode(response)).json(this.parseErrorData(response));
        } else {
          res.json(response.result);
        }
      }),
    );
  }

  private registerAuthRoutes(): void {
    /**
     * Log the user in based on email and password combination
     */
    this.app.post(
      '/login',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(makeCall('user:login', req.body))) as RPCResponseType;

        if (!response || Array.isArray(response) || 'error' in response) {
          res.status(mapStatusCode(response)).json(this.parseErrorData(response));
        } else {
          req.session.user = Array.isArray(response) ? response[0].result : response.result;

          if (req.session.user.territory_id) {
            const list = await this.kernel.handle(
              makeCall(
                'territory:listOperator',
                { territory_id: req.session.user.territory_id },
                { user: req.session.user },
              ),
            );
            req.session.user.authorizedOperators = get(list, 'result', []);
          }

          this.send(res, response);
        }
      }),
    );

    /**
     * Get the user profile (reads from the session rather than the database)
     * @see user:me call for database read
     */
    this.app.get('/profile', (req, res, next) => {
      if (!('user' in req.session)) {
        throw new UnauthorizedException();
      }

      res.json(req.session.user);
    });

    /**
     * Kill the current sesssion
     */
    this.app.post('/logout', (req, res, next) => {
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
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:forgottenPassword',
          params: { email: req.body.email },
        })) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end check an email/password couple for password recovery
     */
    this.app.post(
      '/auth/check-token',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:checkForgottenToken',
          params: { email: req.body.email, token: req.body.token },
        })) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the user change her password by supplying an email, a token and a new password
     */
    this.app.post(
      '/auth/change-password',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:changePasswordWithToken',
          params: { email: req.body.email, token: req.body.token, password: req.body.password },
        })) as RPCResponseType;

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end confirm a pending email with an email and a token
     */
    this.app.post(
      '/auth/confirm-email',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:confirmEmail',
          params: { email: req.body.email, token: req.body.token },
        })) as RPCResponseType;

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
      asyncHandler(async (req, res, next) => {
        if (Array.isArray(req.body)) {
          throw new InvalidRequestException('Cannot create multiple applications at once');
        }

        const user = get(req, 'session.user', null);
        if (!user) throw new UnauthorizedException();
        if (!user.operator_id) throw new UnauthorizedException('Only operators can create applications');

        const response = (await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'application:create',
          params: {
            params: { name: req.body.name },
            _context: { call: { user } },
          },
        })) as RPCResponseType;

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

  // FIXME
  // - add server authentication
  // - block access to POST /certificates route
  private registerCertificateRoutes(): void {
    /**
     * The route that renders an HTML certificate based on params
     * - only accessible by the printer with JWT authentication
     * - requires access to public assets (images)
     *
     * TEST ME : http://localhost:8080/v2/certificates/render?identity=%2B
     */
    this.app.get(
      '/v2/certificates/render/:uuid',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          makeCall('certificate:render', {
            uuid: req.params.uuid,
            token: get(req, 'headers.authorization', '').replace('Bearer ', ''),
          }),
        )) as RPCResponseType;

        this.raw(res, get(response, 'result.data', response), { 'Content-type': 'text/html' });
      }),
    );

    // public assets routes
    this.app.use('/v2/certificates/assets', express.static('../../services/certificate/dist/assets'));

    /**
     * Public route to check a certificate
     */
    this.app.get(
      '/v2/certificates/find/:uuid',
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          makeCall('certificate:find', { uuid: req.params.uuid }),
        )) as RPCResponseType;

        this.raw(res, get(response, 'result.data', response), { 'Content-type': 'application/json' });
      }),
    );

    /**
     * Download a PNG or PDF of the certificate
     * - accessible with an application token
     * - uses /v2/certificates/render to capture the rendered certificate
     * - uses the remote printer to capture the rendered certificate
     * - print a PDF/PNG returned back to the caller
     */
    this.app.get(
      '/v2/certificates/:type/:uuid/',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const type = req.params.type.toLowerCase();
        const uuid = req.params.uuid.replace(/[^a-z0-9-]/gi, '').toLowerCase();

        const call = makeCall('certificate:download', { uuid, type }, { user: get(req, 'session.user', null) });
        const response = (await this.kernel.handle(call)) as RPCResponseType;

        this.raw(res, get(response, 'result', response), {
          'Content-type': type === 'png' ? 'image/png' : 'application/pdf',
          'Content-disposition': `attachment; filename=${uuid}.${type}`,
        });
      }),
    );

    /**
     * Public route for operators to generate a certificate
     * based on params (identity, start date, end date, ...)
     * - accessible with an application token
     * - generate a certificate to be printed when calling /v2/certificates/download/{uuid}
     */
    this.app.post(
      '/v2/certificates',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const response = (await this.kernel.handle(
          makeCall(
            'certificate:create',
            { ...req.body, operator_id: get(req, 'session.user.operator_id') },
            { user: get(req, 'session.user', null) },
          ),
        )) as RPCResponseType;

        res
          .status(get(response, 'result.meta.httpStatus', mapStatusCode(response)))
          .send(get(response, 'result.data', this.parseErrorData(response)));
      }),
    );
  }

  private registerAfterAllHandlers(): void {
    this.app.use(Sentry.Handlers.errorHandler());

    // general error handler
    // keep last
    this.app.use(errorHandlerMiddleware);
  }

  /**
   * Calls to the /rpc endpoint
   */
  private registerCallHandler(): void {
    const endpoint = this.config.get('proxy.rpc.endpoint');
    this.app.get(
      endpoint,
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel
          .getContainer()
          .getHandlers()
          .map((def) => ({
            service: def.service,
            method: def.method,
          }))
          .reduce((acc, { service, method }) => {
            if (!(service in acc)) {
              acc[service] = [];
            }
            acc[service].push(method);
            return acc;
          }, {});
        res.json(response);
      }),
    );

    // register the POST route to /rpc
    this.app.post(
      endpoint,
      asyncHandler(
        async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
          // inject the req.session.user to context in the body
          const isBatch = Array.isArray(req.body);
          const user = get(req, 'session.user', null);

          if (!user) {
            throw new UnauthorizedException();
          }

          // nest the params and _context and inject the session user
          // from { id: 1, jsonrpc: '2.0', method: 'a:b' params: {} }
          // to { id: 1, jsonrpc: '2.0', method: 'a:b' params: { params: {}, _context: {} } }
          req.body = isBatch
            ? req.body.map((doc: RPCSingleCallType) => nestParams(doc, user))
            : nestParams(req.body, user);

          // pass the request to the kernel
          const response = (await this.kernel.handle(req.body)) as RPCResponseType;

          // send the response
          this.send(res, response);
        },
      ),
    );
  }

  private start(port = 8080): void {
    this.server = this.app.listen(port, () => console.log(`Listening on port ${port}`));
  }

  /**
   * Send the response to the client
   * - set optional headers
   * - set the status code (converted from an RPC status code)
   * - set the body. Error patterns are parsed
   */
  private send(res: Response, response: RPCResponseType, headers: { [key: string]: string } = {}): void {
    if ('success' in (response as any)) {
      this.setHeaders(res, headers);
    }

    // get the HTTP status code from response meta or convert RPC code
    const status = get(response, 'result.meta.httpStatus', mapStatusCode(response));

    res.status(status).json(this.parseErrorData(response));
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
  private parseErrorData(response): RPCResponseType {
    if (!('error' in response) || !('data' in response.error)) return response;
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
}
