import http from 'http';
import express, { Response } from 'express';
import expressSession from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { get } from 'lodash';
// tslint:disable-next-line: import-name
import Redis from 'ioredis';
// tslint:disable-next-line: import-name
import createStore from 'connect-redis';
import {
  TransportInterface,
  KernelInterface,
  ConfigInterface,
  ConfigInterfaceResolver,
  EnvInterface,
  EnvInterfaceResolver,
  RPCSingleCallType,
  UnauthorizedException,
  RPCResponseType,
  InvalidRequestException,
} from '@ilos/common';
import { Sentry, SentryProvider } from '@pdc/provider-sentry';
import { mapStatusCode } from '@ilos/transport-http';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

import { dataWrapMiddleware, signResponseMiddleware, errorHandlerMiddleware } from './middlewares';
import { asyncHandler } from './helpers/asyncHandler';
import { makeCall } from './helpers/routeMapping';
import { nestParams } from './helpers/nestParams';
import { serverTokenMiddleware } from './middlewares/serverTokenMiddleware';

export class HttpTransport implements TransportInterface {
  app: express.Express;
  config: ConfigInterface;
  env: EnvInterface;
  port: string;
  server: http.Server;
  tokenProvider;

  constructor(private kernel: KernelInterface) {}

  getKernel() {
    return this.kernel;
  }

  getInstance() {
    return this.server;
  }

  async up(opts: string[] = []) {
    this.getProviders();

    const optsPort = parseInt(opts[0], 10);
    const port = optsPort || optsPort === 0 ? optsPort : this.config.get('proxy.port', 8080);

    this.app = express();
    this.setup();

    this.start(port);
  }

  async down() {
    if (this.server) {
      this.server.close();
    }
  }

  setup() {
    this.registerBeforeAllHandlers();
    this.registerBodyHandler();
    this.registerSessionHandler();
    this.registerSecurity();
    this.registerGlobalMiddlewares();
    this.registerAuthRoutes();
    this.registerApplicationRoutes();
    this.registerLegacyServerRoute();
    this.registerCallHandler();
    this.registerAfterAllHandlers();
  }

  getApp(): express.Express {
    return this.app;
  }

  private async getProviders() {
    this.config = this.kernel.getContainer().get(ConfigInterfaceResolver);
    this.env = this.kernel.getContainer().get(EnvInterfaceResolver);
    this.tokenProvider = this.kernel.getContainer().get(TokenProviderInterfaceResolver);
  }

  private registerBeforeAllHandlers() {
    this.kernel.getContainer().get(SentryProvider);
    this.app.use(Sentry.Handlers.requestHandler());
  }

  private registerBodyHandler() {
    this.app.use(bodyParser.json({ limit: '2mb' }));
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private registerSessionHandler() {
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
          secure: this.env.get('APP_ENV', 'local') !== 'local',
        },
        name: sessionName,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: new redisStore({ client: redis }),
      }),
    );
  }

  private registerSecurity() {
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

    // register the JWT server middleware
    this.app.use(serverTokenMiddleware(this.kernel, this.tokenProvider));
  }

  private registerGlobalMiddlewares() {
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
  private registerLegacyServerRoute() {
    // V1 payload
    this.app.post(
      '/journeys/push',
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

        const response = await this.kernel.handle(makeCall('acquisition:createLegacy', req.body, { user }));

        if (mapStatusCode(response) >= 400) {
          console.log('[error - acq-v1]', this.parseErrorData(response));
        }

        // warn the user about this endpoint deprecation agenda
        // https://github.com/betagouv/preuve-covoiturage/issues/383
        const warning =
          'The POST /journeys/push route will be deprecated at the end of 2019. Please use POST /v2/journeys instead.  Please migrate to the new journey schema. Documentation: https://hackmd.io/@jonathanfallon/HyXkGqxOH';

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
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        const response = await this.kernel.handle(makeCall('acquisition:create', req.body, { user }));

        if (mapStatusCode(response) >= 400) {
          console.log('[error - acq-v2]', this.parseErrorData(response));
        }

        this.send(res, response);
      }),
    );
  }

  private registerAuthRoutes() {
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
              makeCall('territory.listOperator', { territory_id: req.session.user.territory_id }),
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
        const response = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:forgottenPassword',
          params: { email: req.body.email },
        });

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

  private registerApplicationRoutes() {
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

        const token = await this.tokenProvider.sign({
          a: application._id.toString(),
          o: application.owner_id,
          s: application.owner_service,
          p: application.permissions,
          v: 2,
        });

        res.status(201).json({ application, token });
      }),
    );
  }

  private registerAfterAllHandlers() {
    this.app.use(Sentry.Handlers.errorHandler());

    // general error handler
    // keep last
    this.app.use(errorHandlerMiddleware);
  }

  /**
   * Calls to the /rpc endpoint
   */
  private registerCallHandler() {
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

  private start(port: number = 8080) {
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
}
