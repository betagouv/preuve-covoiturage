import path from 'path';
import http from 'http';
import express from 'express';
import expressSession from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUiExpress from 'swagger-ui-express';
import bodyParser from 'body-parser';
import { get, set } from 'lodash';

import {
  TransportInterface,
  KernelInterface,
  ConfigInterface,
  ConfigInterfaceResolver,
  EnvInterface,
  EnvInterfaceResolver,
} from '@ilos/common';

import { Sentry, SentryProvider } from '@pdc/provider-sentry';
import { TokenProvider } from '@pdc/provider-token';

import { dataWrapMiddleware, signResponseMiddleware, errorHandlerMiddleware } from './middlewares';
import openapiJson from './static/openapi.json';
import { asyncHandler } from './helpers/asyncHandler';
import { makeCall, routeMapping } from './helpers/routeMapping';
import { serverTokenMiddleware } from './middlewares/serverTokenMiddleware';

export class HttpTransport implements TransportInterface {
  app: express.Express;
  config: ConfigInterface;
  env: EnvInterface;
  port: string;
  server: http.Server;

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
    this.registerServerAuth();
    this.registerGlobalMiddlewares();
    this.registerAuth();
    this.registerSwagger();
    this.registerBullArena();
    this.registerRoutes();

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
    const sessionSecret = this.config.get('proxy.session.secret');
    const sessionName = this.config.get('proxy.session.name');
    this.app.use(
      expressSession({
        cookie: {
          path: '/',
          httpOnly: true,
          secure: false, // true in production
          maxAge: null,
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

    const corsOrigin = this.config.get('proxy.cors');

    this.app.use(
      cors({
        origin: corsOrigin,
        optionsSuccessStatus: 200,
      }),
    );
  }

  private registerGlobalMiddlewares() {
    this.app.use(signResponseMiddleware);
    this.app.use(dataWrapMiddleware);
  }

  private registerServerAuth() {
    const tokenProvider = new TokenProvider({
      secret: this.config.get('jwt.secret'),
      ttl: this.config.get('jwt.ttl'),
    });

    // inject the operator_id in the query
    this.app.use(serverTokenMiddleware(this.kernel, tokenProvider));
  }

  private registerAuth() {
    this.app.post(
      '/login',
      asyncHandler(async (req, res, next) => {
        try {
          const response = await this.kernel.handle(makeCall('user:login', req.body));
          if (!response || Array.isArray(response) || 'error' in response) {
            throw new Error('Forbidden');
          }
          req.session.user = response.result;
          res.json(response.result);
        } catch (e) {
          throw e;
        }
      }),
    );

    // this.app.get('/profile', (req, res, next) => {
    //   if (!('user' in req.session)) {
    //     throw new Error('Unauthenticated');
    //   }

    //   res.json(req.session.user);
    // });

    this.app.post('/logout', (req, res, next) => {
      req.session.destroy((err) => {
        if (err) {
          throw new Error(err.message);
        }
        res.status(204).end();
      });
    });
  }

  private registerSwagger() {
    // serve static files
    this.app.use(express.static(path.join(__dirname, 'static')));

    // OpenAPI specification UI
    this.app.use('/openapi', swaggerUiExpress.serve, swaggerUiExpress.setup(openapiJson));
  }

  private registerBullArena() {
    // this.app.use('/arena', require('./routes/bull-arena/controller'));
  }

  private registerAfterAllHandlers() {
    this.app.use(Sentry.Handlers.errorHandler());

    // general error handler
    // keep last
    this.app.use(errorHandlerMiddleware);
  }

  private registerRoutes() {
    routeMapping(this.config.get('routes.routeMap', []), this.app, this.kernel);
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
      asyncHandler(async (req, res, next) => {
        // inject the req.session.user to context in the body
        const isBatch = Array.isArray(req.body);
        const _context = get(isBatch ? req.body[0] : req.body, 'params._context', {});
        const user = get(req, 'session.user', null);
        if (user) {
          set(_context, 'call.user', user);
          if (isBatch) {
            req.body = req.body.map((doc) => {
              set(doc, 'params._context', _context);
            });
          } else {
            set(req.body, 'params._context', _context);
          }
        }

        // pass the request to the kernel
        res.json(await this.kernel.handle(req.body));
      }),
    );
  }

  private start(port: number = 8080) {
    this.server = this.app.listen(port, () => console.log(`Listening on port ${port}`));
  }
}

// const { expressErrorHandler } = require('@pdc/package-express-errors');

// const { sentry: Sentry } = require('@pdc/shared-providers');
// const { signResponse, dataWrap, jwtUser } = require('@pdc/shared-middlewares');

// const { eventBus } = require('@pdc/shared-worker').bus;
// const { bus: journeyBus } = require('@pdc/service-acquisition').acquisition.transports;

// const { PORT, sessionSecret } = require('@pdc/shared-config');
// const { appUrl } = require('@pdc/shared-helpers').url(process.env.APP_URL, process.env.API_URL);

// default response
// this.app.use('/auth', require('@pdc/service-auth').auth.transports.http);
// this.app.use('/stats', require('@pdc/service-stats').stats.transports.http);
// this.app.use('/profile', jwtUser, require('@pdc/service-user').user.transports.profileHttp);
// this.app.use('/users', jwtUser, require('@pdc/service-user').user.transports.userHttp);
// this.app.use('/aom', jwtUser, require('@pdc/service-organization').transports.aomHttp);
// this.app.use('/operators', jwtUser, require('@pdc/service-organization').transports.operatorHttp);
// this.app.use('/trips', jwtUser, require('@pdc/service-trip').trip.transports.http);
// this.app.use('/incentive/incentives', jwtUser, require('@pdc/service-incentive').incentive.transports.http);
// this.app.use('/incentive/parameters', jwtUser, require('@pdc/service-policy').policy.transports.parameterHttp);
// this.app.use('/incentive/campaigns', jwtUser, require('@pdc/service-policy').policy.transports.campaignHttp);
// this.app.use('/incentive/policies', jwtUser, require('@pdc/service-policy').policy.transports.policyHttp);
// this.app.use('/incentive/units', jwtUser, require('@pdc/service-policy').policy.transports.unitHttp);
// this.app.use('/journeys', require('@pdc/service-acquisition').acquisition.transports.http);
