const router = require("express").Router();
const operatorService = require("./operatorService");

/**
 * get an Operator by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    res.json(await operatorService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * update an Operator by ID
 */
router.put("/:id", async (req, res, next) => {
  try {
    res.json(await operatorService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an Operator
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = operatorService.delete(req.params.id, !!req.query.force);

    res.json({
      id: res.params.id,
      deleted,
      force: res.params.query.force,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * List all Operators
 */
router.get("/", async (req, res, next) => {
  try {
    res.json(await operatorService.find({}));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new Operator
 */
router.post("/", async (req, res, next) => {
  try {
    res.json(await operatorService.create(req.body));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
