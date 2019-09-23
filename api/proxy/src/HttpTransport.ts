import http from 'http';
import express from 'express';
import expressSession from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { get } from 'lodash';
import {
  TransportInterface,
  KernelInterface,
  ConfigInterface,
  ConfigInterfaceResolver,
  EnvInterface,
  EnvInterfaceResolver,
  RPCSingleCallType,
  UnauthorizedException,
} from '@ilos/common';
import { Sentry, SentryProvider } from '@pdc/provider-sentry';
import { mapStatusCode } from '@ilos/transport-http';
import { TokenProvider } from '@pdc/provider-token';

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
  tokenProvider: TokenProvider;

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
    this.registerLegacyServerRoute();

    if (this.config.get('proxy.rpc.open', false)) {
      this.registerCallHandler();
    }

    this.registerAfterAllHandlers();
  }

  getApp(): express.Express {
    return this.app;
  }

  private async getProviders() {
    this.config = this.kernel.getContainer().get(ConfigInterfaceResolver);
    this.env = this.kernel.getContainer().get(EnvInterfaceResolver);

    this.tokenProvider = new TokenProvider({
      secret: this.config.get('jwt.secret'),
      ttl: this.config.get('jwt.ttl'),
    });
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
        // store, TODO: use redis
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
   *    appId: string,
   *    operatorId: string,
   *    permissions: [string],
   * }
   */
  private registerLegacyServerRoute() {
    this.app.post(
      '/journeys/push',
      asyncHandler(async (req, res, next) => {
        const user = get(req, 'session.user', {});
        res.json(await this.kernel.handle(makeCall('acquisition:create', req.body, { user })));
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
          res.status(mapStatusCode(response)).json(response);
        } else {
          req.session.user = Array.isArray(response) ? response[0].result : response.result;
          res.status(mapStatusCode(response)).json(response);
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
        const rpcResponse = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:forgottenPassword',
          params: { email: req.body.email },
        });
        res.status(mapStatusCode(rpcResponse)).json(rpcResponse);
      }),
    );

    /**
     * Let the front-end check an email/password couple for password recovery
     */
    this.app.post(
      '/auth/check-token',
      asyncHandler(async (req, res, next) => {
        const rpcResponse = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:checkForgottenToken',
          params: { email: req.body.email, forgotten_token: req.body.token },
        });
        res.status(mapStatusCode(rpcResponse)).json(rpcResponse);
      }),
    );

    /**
     * Let the user change her password by supplying an email, a token and a new password
     */
    this.app.post(
      '/auth/change-password',
      asyncHandler(async (req, res, next) => {
        const rpcResponse = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:changePasswordWithToken',
          params: { email: req.body.email, forgotten_token: req.body.token, password: req.body.password },
        });
        res.status(mapStatusCode(rpcResponse)).json(rpcResponse);
      }),
    );

    /**
     * Let the front-end confirm a pending email with an email and a token
     */
    this.app.post(
      '/auth/confirm-email',
      asyncHandler(async (req, res, next) => {
        const rpcResponse = await this.kernel.handle({
          id: 1,
          jsonrpc: '2.0',
          method: 'user:confirmEmail',
          params: { email: req.body.email, forgotten_token: req.body.token },
        });
        res.status(mapStatusCode(rpcResponse)).json(rpcResponse);
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
          const rpcResponse = await this.kernel.handle(req.body);

          // send the response
          res.status(mapStatusCode(rpcResponse)).json(rpcResponse);
        },
      ),
    );
  }

  private start(port: number = 8080) {
    this.server = this.app.listen(port, () => console.log(`Listening on port ${port}`));
  }
}
