const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const expressErrorHandler = require('@pdc/package-express-errors');

const Sentry = require('@pdc/shared/providers/sentry/sentry');
const signResponse = require('@pdc/shared/middlewares/sign-response');
const dataWrap = require('@pdc/shared/middlewares/data-wrap');
const jwtUser = require('@pdc/shared/middlewares/jwt-user');

const eventBus = require('@pdc/shared/bus');
const { bus: journeyBus } = require('@pdc/service-acquisition').acquisition.transports;

const { PORT, sessionSecret } = require('@pdc/shared/config.js');
const { appUrl } = require('@pdc/shared/helpers/url/url')(process.env.APP_URL, process.env.API_URL);

const swaggerDocument = require('./static/openapi.json');

require('./definitions');
// require('./passport')(passport);
require('./mongo');

const app = express();

// plugin Sentry - before other middlewares
app.use(Sentry.Handlers.requestHandler());

// handle body content-type conversion
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(
  require('express-session')({ secret: sessionSecret, resave: false, saveUninitialized: false }),
);

// eslint-disable-next-line no-console
console.log('CORS', process.env.NODE_ENV === 'review' ? '*' : appUrl());

// protect with typical headers and enable cors
app.use(helmet());
app.use(
  cors({
    origin: appUrl('', { allowNull: true, forceGeneration: (process.env.NODE_ENV === 'review') }) || '*',
    optionsSuccessStatus: 200,
  }),
);
app.use(signResponse);
app.use(dataWrap);

// init the authentication system
app.use(passport.initialize());
app.use(passport.session());

// Route definitions
app.get('/', (req, res) => {
  res.json({ status: 'Hello World' });
});

// serve static files
app.use(express.static(path.join(__dirname, 'static')));

// OpenAPI specification UI
app.use('/openapi', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// default response
app.use('/auth', require('@pdc/service-auth').auth.transports.http);
app.use('/stats', require('@pdc/service-stats/transports/http'));
app.use('/profile', jwtUser, require('@pdc/service-user/transports/profilehttp'));
app.use('/users', jwtUser, require('@pdc/service-user/transports/userhttp'));
app.use('/aom', jwtUser, require('@pdc/service-organization').organization.transports.aomHttp);
app.use('/operators', jwtUser, require('@pdc/service-organization').organization.transports.operatorHttp);
app.use('/trips', jwtUser, require('@pdc/service-trip/transports/http'));
app.use('/incentive/incentives', jwtUser, require('@pdc/service-incentive').incentive.transports.http);
app.use('/incentive/parameters', jwtUser, require('@pdc/service-policy').policy.transports.parameterHttp);
app.use('/incentive/campaigns', jwtUser, require('@pdc/service-policy').policy.transports.campaignHttp);
app.use('/incentive/policies', jwtUser, require('@pdc/service-policy').policy.transports.policyHttp);
app.use('/incentive/units', jwtUser, require('@pdc/service-policy').policy.transports.unitHttp);
app.use('/journeys', require('@pdc/service-acquisition').acquisition.transports.http);

// Arena access for queues
app.use('/arena', require('./routes/bull-arena/controller'));

// configure events for each model
// ! singular names here ;)
eventBus.register('journey', journeyBus);

// plugin Sentry error - after routes, before other middlewares
app.use(Sentry.Handlers.errorHandler());

// general error handler
// keep last
app.use(expressErrorHandler);

// export the http.Server object
// eslint-disable-next-line no-console
module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
