const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry.js");
require("../passport")(passport);
const Proof = require("./proofModel");

router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    users = await Proof.find({});
  } catch (e) {
    capture(e);
    return res.status(500).send({ e });
  }
  res.status(200).send(users);
});

module.exports = router;
