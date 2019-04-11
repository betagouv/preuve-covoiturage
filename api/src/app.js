const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const { PORT, sessionSecret } = require('./config.js');
const Sentry = require('./sentry.js');
const eventBus = require('./events/bus');
const signResponse = require('./middlewares/sign-response');
const dataWrap = require('./middlewares/data-wrap');
const swaggerDocument = require('./static/openapi.json');

require('./definitions');
// require('./passport')(passport);
require('./mongo');

// require after above passport
const jwtUser = require('./middlewares/jwt-user');

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
  origin: process.env.APP_URL || '*',
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
// app.use('/auth', require('./routes/auth/controller'));
// app.use('/stats', require('./routes/stats/controller'));
// app.use('/profile', jwtUser, require('./routes/profile/controller'));
// app.use('/users', jwtUser, require('./routes/users/controller'));
// app.use('/aom', jwtUser, require('./routes/aom/controller'));
// app.use('/operators', jwtUser, require('./routes/operators/controller'));
// app.use('/trips', jwtUser, require('./routes/trips/controller'));
// app.use('/incentive/incentives', jwtUser, require('./routes/incentive/incentives/controller'));
// app.use('/incentive/parameters', jwtUser, require('./routes/incentive/parameters/controller'));
// app.use('/incentive/campaigns', jwtUser, require('./routes/incentive/campaigns/controller'));
// app.use('/incentive/policies', jwtUser, require('./routes/incentive/policies/controller'));
// app.use('/incentive/units', jwtUser, require('./routes/incentive/units/controller'));
app.use('/journeys', require('./services/acquisition/transports/http'));

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
