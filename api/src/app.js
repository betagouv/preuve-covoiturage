const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const { PORT } = require("./config.js");
const Sentry = require("./sentry.js");

require("./passport")(passport);
require("./mongo");

const app = express();

// plugin Sentry - before other middlewares
app.use(Sentry.Handlers.requestHandler());

app.use(bodyParser.json({ limit: "2mb" }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(passport.initialize());

app.get('/', function mainHandler(req, res) {
  throw new Error('Broke!');
});

app.use("/auth", require("./auth/authController"));
app.use("/users", require("./users/userController"));

// plugin Sentry error - after routes, before other middlewares
app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => console.log("Listening on port " + PORT));
