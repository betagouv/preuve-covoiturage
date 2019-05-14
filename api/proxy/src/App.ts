import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { Sentry, SentryProvider } from '@pdc/provider-sentry';

import { Kernel, Interfaces, Providers, bootstrap } from './bridge';
import { dataWrapMiddleware, signResponseMiddleware, errorHandlerMiddleware } from './middlewares';
import swaggerDocument from './static/openapi.json';
import { asyncHandler } from './helpers/asyncHandler';

export class App {
  app: express.Express;
  kernel: Interfaces.KernelInterface;
  config: Providers.ConfigProvider;
  port: string;

  constructor() {
    this.app = express();
    this.kernel = new Kernel();
  }

  async up() {
    await this.bootKernel();
    this.registerBeforeAllHandlers();
    this.registerBodyHandler();
    this.registerSessionHandler();
    this.registerSecurity();
    this.registerGlobalMiddlewares();
    this.registerPassport();
    this.registerSwagger();
    this.registerBullArena();
    this.registerRoutes();
    this.registerCallHandler();
    this.registerAfterAllHandlers();
    this.start();
  }

  getApp(): express.Express {
    return this.app;
  }

  private async bootKernel() {
    bootstrap.setEnvironment();
    await this.kernel.boot();
    this.config = this.kernel.getContainer().get(Providers.ConfigProvider)
    this.app.locals.kernel = this.kernel;
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
    this.app.use(cookieParser());
    const sessionSecret = this.config.get('proxy.sessionSecret');
    this.app.use(
      expressSession({ secret: sessionSecret, resave: false, saveUninitialized: false }),
    );
  }
  
  private registerSecurity() {
    // protect with typical headers and enable cors
    this.app.use(helmet());

    const appUrl = this.config.get('proxy.appUrl');
    this.app.use(
      cors({
        origin: process.env.NODE_ENV === 'review' ? '*' : appUrl,
        optionsSuccessStatus: 200,
      }),
    );
  }
  
  private registerGlobalMiddlewares() {
    this.app.use(signResponseMiddleware);
    this.app.use(dataWrapMiddleware);
  }

  private registerPassport() {
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    
  }

  private registerSwagger() {
    // serve static files
    this.app.use(express.static(path.join(__dirname, 'static')));

    // OpenAPI specification UI
    this.app.use('/openapi', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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

  }

  private registerCallHandler() {
    const endpoint = this.config.get('proxy.rpcEndpoint', '/rpc');
    this.app.post(endpoint, asyncHandler(async (req, res, next) => {
      const response = await this.kernel.handle(req.body);
      res.json(response);
    }));
  }

  private start() {
    const port = this.config.get('proxy.port', 8080);
    this.app.listen(port, () => console.log(`Listening on port ${port}`))
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

