const router = require("express").Router();
const _ = require("lodash");
const Proof = require("./proofModel");
const { CsvConverter } = require("@pdc/proof-helpers");
const config = require("@pdc/config");

/**
 * Download a collection of proofs in a format (default csv)
 * Scope results by AOM or Operator
 * Pass format as ?format={csv}
 */
router.get("/download", async (req, res, next) => {
  try {
    // Build the query
    const query = {};

    if (_.has(req, 'aom.siren')) {
      query["aom.siren"] = req.aom.siren;
    }

    if (_.has(req, 'operator.siren')) {
      query["operator.siren"] = req.operator.siren;
    }

    const results = await Proof.find(query);

    // convert to an array based on configuration file
    let _arr = [];
    const proofs = results.map((proof) => {
      _arr = [];
      config.proofsCsv.headers.forEach((cfg) => {
        _arr.push(_.get(proof, cfg.path, ""));
      });

      return _arr;
    });

    // output in required format
    switch (req.query.format || 'csv') {
      case 'csv':
        const csv = new CsvConverter(proofs, config.proofsCsv);
        const data = await csv.convert();
        res.set('Content-type', 'text/csv').send(data);
        break;

      default:
        throw new Error('Unsupported format');
    }
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    res.json(await Proof.find({ _id: id }));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    res.json({ todo: 'update proof' });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    res.json({ todo: 'delete proof' });
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await Proof.find({}));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const proof = new Proof(req.body);
    await proof.save();

    res.json({ proof });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
