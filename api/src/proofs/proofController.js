const router = require("express").Router();
const Proof = require("./proofModel");
const { CsvConverter } = require("@pdc/proof-helpers");
const config = require("@pdc/config");

router.get("/", (req, res) => {
  res.json(Proof.find({}));
});

router.post("/", (req, res) => {
  res.json({ todo: 'create proof' });
});

router.get("/download", async (req, res, next) => {
  try {
    const dummy = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ];

    switch (req.query.format || 'csv') {
      case 'csv':
        const csv = new CsvConverter(dummy, config.proofsCsv);
        const data = await csv.convert();
        res.set('Content-type', 'text/csv').send(data);
        break;

      default:
        throw new Error('Unsupported format');
    }
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  res.json(Proof.find({ _id: id }));
});

router.put("/:id", (req, res) => {
  res.json({ todo: 'update proof' });
});

router.delete("/:id", (req, res) => {
  res.json({ todo: 'delete proof' });
});

module.exports = router;
