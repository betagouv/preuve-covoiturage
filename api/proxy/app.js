const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');

const Sentry = require('@pdc/shared/providers/sentry/sentry');
const signResponse = require('@pdc/shared/middlewares/sign-response');
const dataWrap = require('@pdc/shared/middlewares/data-wrap');
const jwtUser = require('@pdc/shared/middlewares/jwt-user');

const { PORT, sessionSecret } = require('./config.js');
const { appUrl } = require('./packages/url');

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
app.use(require('express-session')({ secret: sessionSecret, resave: false, saveUninitialized: false }));

// protect with typical headers and enable cors
app.use(helmet());
app.use(cors({
  origin: appUrl('', { allowNull: true }) || '*',
  optionsSuccessStatus: 200,
}));
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
app.use('/auth', require('@pdc/service-auth/transports/http'));
app.use('/stats', require('@pdc/service-stats/transports/http'));
app.use('/profile', jwtUser, require('@pdc/service-user/transports/profilehttp'));
app.use('/users', jwtUser, require('@pdc/service-user/transports/userhttp'));
app.use('/aom', jwtUser, require('@pdc/service-organization/transports/aomhttp'));
app.use('/operators', jwtUser, require('@pdc/service-organization/transports/operatorhttp'));
app.use('/trips', jwtUser, require('@pdc/service-trip/transports/http'));
app.use('/incentive/incentives', jwtUser, require('@pdc/service-incentive/transports/http'));
app.use('/incentive/parameters', jwtUser, require('@pdc/service-policy/transports/parameterhttp'));
app.use('/incentive/campaigns', jwtUser, require('@pdc/service-policy/transports/campaignhttp'));
app.use('/incentive/policies', jwtUser, require('@pdc/service-policy/transports/policyhttp'));
app.use('/incentive/units', jwtUser, require('@pdc/service-policy/transports/unithttp'));
app.use('/journeys', require('@pdc/service-acquisition/transports/http'));

// Arena access for queues
// app.use('/arena', require('./routes/bull-arena/controller'));

// configure events for each model
// ! singular names here ;)


// plugin Sentry error - after routes, before other middlewares
app.use(Sentry.Handlers.errorHandler());

// error handler - !! keep the next argument !!
// otherwise Express doesn't use it as error handler
// https://expressjs.com/en/guide/error-handling.html
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let output;

  switch (err.name) {
    case 'MongoError':
      switch (err.message.match(/^([A-Z0-9])+/)[0]) {
        case 'E11000':
          output = res.status(409);
          break;
        default:
          output = res.status(500);
      }
      break;

    case 'BadRequestError':
    case 'ValidationError':
      output = res.status(400);
      break;

    case 'UnauthorizedError':
      output = res.status(401);
      break;

    case 'ForbiddenError':
      output = res.status(403);
      break;

    case 'NotFoundError':
      output = res.status(404);
      break;

    case 'ConflictError':
      output = res.status(409);
      break;

    case 'InternalServerError':
      output = res.status(500);
      break;

    default:
      output = res.status(500);
  }

  output.json({ name: err.name, message: err.message });
});

// export the http.Server object
// eslint-disable-next-line no-console
module.exports = app.listen(PORT || 0, () => console.log(`Listening on port ${PORT}`));
