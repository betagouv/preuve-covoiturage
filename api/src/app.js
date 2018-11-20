const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const { PORT } = require("./config.js");
const Sentry = require("./sentry.js");

// middlewares
// const { aom } = require("@pdc/middlewares");
// const { operator } = require("@pdc/middlewares");

require("./passport")(passport);
require("./mongo");

const app = express();

// plugin Sentry - before other middlewares
app.use(Sentry.Handlers.requestHandler());

// handle body content-type conversion
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

// protect with typical headers and enable cors
app.use(helmet());
app.use(cors());

// init the authentication system
app.use(passport.initialize());

// Route definitions
// auth is the middleware declared on each group of routes
const auth = passport.authenticate("jwt", { session: false });

app.use("/auth", require("./auth/authController"));
app.use("/users", auth, require("./users/userController"));
app.use("/aom", auth, require("./aom/aomController"));
app.use("/operators", auth, require("./operators/operatorController"));
app.use("/proofs", auth, require("./proofs/proofController"));

// plugin Sentry error - after routes, before other middlewares
app.use(Sentry.Handlers.errorHandler());

// error handler - !! keep the next argument !!
// otherwise Express doesn't use it as error handler
// https://expressjs.com/en/guide/error-handling.html
app.use((err, req, res, next) => {
  let output;

  switch (err.name) {
    case 'ValidationError':
      output = res.status(400);
      break;

    default:
      output = res.status(500);
  }

  output.json({ name: err.name, message: err.message });
});

app.listen(PORT, () => console.log("Listening on port " + PORT));
