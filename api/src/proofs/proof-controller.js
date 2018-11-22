const router = require("express").Router();
const _ = require("lodash");
const Proof = require("./proof-model");
const proofService = require("./proof-service");
const aomService = require("../aom/aom-service");

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
    // the list of all touched AOM during the journey
    // journey_span for each AOM is a percentage of the journey
    // which is done in each AOM
    const queries = [
      req.body.start,
      req.body.end,
    ].reduce((p, c) => {
      const query = {};
      if (_.has(c, 'lat')) query.lat = c.lat;
      if (_.has(c, 'lng')) query.lng = c.lng;
      if (_.has(c, 'insee')) query.insee = c.insee;
      if (Object.keys(query).length) p.push(query);

      return p;
    }, []);

    const aomList = (await Promise.all(queries.map(aomService.search)))
      .map(i => i.toJSON())
      .map(i => _.assign(i, {
        id: `${i._id}`,
        journey_span: 100,
      }));

    const data = _.assign(
      req.body,
      { operator: req.operator },
      { aom: _.uniqBy(aomList, "id") },
    );

    res.json(await proofService.create(data));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
