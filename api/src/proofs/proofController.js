const router = require("express").Router();
const Proof = require("./proofModel");
const { CsvConverter } = require("@pdc/proof-helpers");
const config = require("@pdc/config");

router.get("/", async (req, res) => {
  res.json(await Proof.find({}));
});

router.post("/", async (req, res) => {
  res.json({ todo: 'create proof' });
});

router.get("/download", async (req, res) => {
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
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  res.json(await Proof.find({ _id: id }));
});

router.put("/:id", async (req, res) => {
  res.json({ todo: 'update proof' });
});

router.delete("/:id", async (req, res) => {
  res.json({ todo: 'delete proof' });
});

module.exports = router;
