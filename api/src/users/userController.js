const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry.js");
require("../passport")(passport);
const User = require("./userModel");

router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const query = {};
  if (req.query.group && req.query.group !== "admin") {
    query.group = req.query.group;
  }
  try {
    users = await User.find(query);
  } catch (e) {
    capture(e);
    return res.status(500).send({ e });
  }
  res.status(200).send(users);
});

module.exports = router;
