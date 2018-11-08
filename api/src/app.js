const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const { PORT } = require("./config.js");
// const { capture } = require("./sentry.js");

require("./passport")(passport);
require("./mongo");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(passport.initialize());

app.use("/auth", require("./auth/authController"));
app.use("/users", require("./users/userController"));

app.listen(PORT, () => console.log("Listening on port " + PORT));
