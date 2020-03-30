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
  RPCResponseType,
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
    this.registerJourneyStatusRoutes();
    this.registerApplicationRoutes();
    this.registerCertificateRoutes();
    this.registerLegacyServerRoute();
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
  private registerLegacyServerRoute(): void {
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

    // V2 payload
    this.app.post(
      '/v2/journeys',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const response = await this.kernel.handle(
          makeCall('acquisition:create', req.body, { user, metadata: { req } }),
        );

        this.send(res, response);
      }),
    );

    this.app.delete(
      '/v2/journeys/:id',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const response = await this.kernel.handle(
          makeCall(
            'acquisition:cancel',
            {
              ...req.body,
              acquisition_id: parseInt(req.params.id, 10),
            },
            { user, metadata: { req } },
          ),
        );

        this.send(res, response);
      }),
    );
  }

  private registerStatsRoutes(): void {
    this.app.get(
      '/stats',
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.handle(
          makeCall('trip:stats', {}, { user: { permissions: ['trip.stats'] } }),
        );

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
        const response = await this.kernel.handle(makeCall('user:login', req.body));

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
            console.log('req.session.user.authorizedOperators : ', req.session.user.authorizedOperators);
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
        const response = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:forgottenPassword',
          params: { email: req.body.email },
        });

        console.log(response);

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end check an email/password couple for password recovery
     */
    this.app.post(
      '/auth/check-token',
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:checkForgottenToken',
          params: { email: req.body.email, token: req.body.token },
        });

        this.send(res, response);
      }),
    );

    /**
     * Let the user change her password by supplying an email, a token and a new password
     */
    this.app.post(
      '/auth/change-password',
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:changePasswordWithToken',
          params: { email: req.body.email, token: req.body.token, password: req.body.password },
        });

        this.send(res, response);
      }),
    );

    /**
     * Let the front-end confirm a pending email with an email and a token
     */
    this.app.post(
      '/auth/confirm-email',
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:confirmEmail',
          params: { email: req.body.email, token: req.body.token },
        });

        this.send(res, response);
      }),
    );
  }

  private registerJourneyStatusRoutes(): void {
    this.app.get(
      '/journeys/:journey_id',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const { journey_id } = req.params;

        const user = get(req, 'session.user', null);

        // make sure there is a user
        if (!user || !('permissions' in user)) {
          return res.status(401).json({
            journey_id,
            error: {
              code: 401,
              message: 'Unauthorized. An application token is required',
            },
          });
        }

        // validate permissions
        if (user.permissions.indexOf('journey.status') === -1) {
          return res.status(403).json({
            journey_id,
            error: {
              code: 403,
              message:
                "Forbidden. The 'journey.status' permission is required " +
                'to access this route. Your application token might need to be ' +
                `updated. Navigate to ${this.config.get('proxy.appUrl')}/admin/api and ` +
                'generate a new application token to get this permission.',
            },
          });
        }

        // check the journey_id pattern
        if (new RegExp('[^a-z0-9-_]', 'i').test(journey_id)) {
          return res.status(400).json({
            journey_id,
            error: {
              code: 400,
              message: 'Invalid journey_id. Must match /[a-z0-9-_]/i pattern',
            },
          });
        }

        // call the action with the session user as context
        const response = await this.kernel.handle(
          nestParams({ id: 1, jsonrpc: '2.0', method: 'acquisition:status', params: { journey_id } }, user),
        );

        const anyResponse = (response as unknown) as any;
        console.log({ anyResponse });
        if ('result' in anyResponse) res.status(mapStatusCode(anyResponse)).json(anyResponse.result);
        else if ('error' in anyResponse) res.status(mapStatusCode(anyResponse)).json(anyResponse.error);
        else
          res.status(500).json({
            journey_id,
            error: {
              code: 500,
              message: 'Server error',
            },
          });
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

        const response = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'application:create',
          params: {
            params: { name: req.body.name },
            _context: { call: { user } },
          },
        });

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
     * TEST ME : http://localhost:8080/certificates/render?identity=%2B
     */
    this.app.get(
      '/certificates/render/:uuid',
      asyncHandler(async (req, res, next) => {
        try {
          if (get(req, 'headers.authorization', '') === '') {
            throw new UnauthorizedException();
          }

          const response = await this.kernel.call(
            'certificate:render',
            {
              uuid: req.params.uuid,
              token: String(req.headers.authorization).replace('Bearer ', ''),
            },
            { channel: { service: 'certificate' } },
          );

          if (!response || !response.data) {
            throw new Error('Failed to generate certificate');
          }

          res.set('Content-type', response.type);
          res.status(response.code);
          res.send(response.data);
        } catch (e) {
          console.log('rpcError' in e ? e.rpcError : e.message);
          console.log(e.stack);
          throw e;
        }
      }),
    );

    // public assets routes
    this.app.use('/certificates/assets', express.static('../../services/certificate/dist/assets'));

    /**
     * Download a PNG or PDF of the certificate
     * - accessible with an application token
     * - uses /certificates/render to capture the rendered certificate
     * - uses the remote printer to capture the rendered certificate
     * - print a PDF/PNG returned back to the caller
     */
    this.app.get(
      '/certificates/download/:uuid',
      asyncHandler(async (req, res, next) => {
        try {
          if (get(req, 'headers.authorization', '') === '') {
            throw new UnauthorizedException();
          }

          const type = this.getTypeFromHeaders(req.headers);
          const uuid = req.params.uuid.replace(/[^a-z0-9-]/gi, '').toLowerCase();

          const response = await this.kernel.call(
            'certificate:download',
            { uuid, type },
            { channel: { service: 'certificate' } },
          );

          switch (type) {
            case 'png':
              res.set('Content-type', 'image/png');
              res.set('Content-disposition', `attachment; filename=${uuid}.png`);
              res.send(response);
              break;
            // case 'json':
            //   res.set('Content-type', 'application/json');
            //   res.send(response);
            //   break;
            default:
              res.set('Content-type', 'application/pdf');
              res.set('Content-disposition', `attachment; filename=${uuid}.pdf`);
              res.send(response);
          }
        } catch (e) {
          // TODO check this
          console.log(e);
          const htmlStatusCode = mapStatusCode({ id: 1, jsonrpc: '2.0', error: e.rpcError });
          res.status(htmlStatusCode);
          res.json({ error: htmlStatusCode, message: e.rpcError.data });
        }
      }),
    );

    /**
     * Public route for operators to generate a certificate
     * based on params (identity, start date, end date, ...)
     * - accessible with an application token
     * - generate a certificate to be printed when calling /certificates/download/{uuid}
     */
    this.app.post(
      '/certificates',
      serverTokenMiddleware(this.kernel, this.tokenProvider),
      asyncHandler(async (req, res, next) => {
        const response = await this.kernel.call(
          'certificate:create',
          { ...req.body },
          { channel: { service: 'certificate' } },
        );

        // return 201 CREATED or 404 NOT FOUND...
        this.send(res, response);
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
          const response = await this.kernel.handle(req.body);

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
   */
  private send(res: Response, response: RPCResponseType): void {
    res.status(mapStatusCode(response)).json(this.parseErrorData(response));
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

  private getTypeFromHeaders(headers: { [key: string]: string }): 'png' | 'json' | 'pdf' {
    switch (headers['accept']) {
      case 'image/png':
        return 'png';
      case 'application/json':
        return 'json';
      default:
        return 'pdf';
    }
  }
}
