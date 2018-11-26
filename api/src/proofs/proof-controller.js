const router = require("express").Router();
const _ = require("lodash");
const Proof = require("./proof-model");
const proofService = require("./proof-service");

/**
 * Download a collection of proofs in a format (default csv)
 * Scope results by AOM or Operator
 * Pass format as ?format={csv}
 */
router.get("/download", async (req, res, next) => {
  try {
    const query = {};

    if (_.has(req, 'aom.siren')) {
      query["aom.siren"] = req.aom.siren;
    }

    if (_.has(req, 'operator.siren')) {
      query["operator.siren"] = req.operator.siren;
    }

    res
      .set('Content-type', 'text/csv')
      .send(await proofService.convert(await Proof.find(query), 'csv'));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    res.json(await proofService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    res.json(await proofService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    res.json(await proofService.delete(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await proofService.find({}));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.json(await proofService.create(_.assign(
      req.body,
      { operator: req.operator }
    )));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
