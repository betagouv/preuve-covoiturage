const router = require("express").Router();
const Proof = require("./proofModel");

router.get("/", async (req, res) => {
  res.json(await Proof.find({}));
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  res.json(await Proof.find({ _id: id }));
});


module.exports = router;
