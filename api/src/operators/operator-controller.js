const router = require("express").Router();
const operatorService = require("./operator-service");

/**
 * Add a user to an operator
 */
router.post("/:id/users/add", async (req, res, next) => {
  try {
    res.json(await operatorService.addUser(req.params.id, req.body.user));
  } catch (e) {
    next(e);
  }
});

/**
 * Remove a user to an operator
 */
router.post("/:id/users/remove", async (req, res, next) => {
  try {
    res.json(await operatorService.removeUser(req.params.id, req.body.user));
  } catch (e) {
    next(e);
  }
});

/**
 * List all users from an operator
 */
router.get("/:id/users", async (req, res, next) => {
  try {
    res.json(await operatorService.users(req.params.id));
  } catch (e) {
    next(e);
  }
});

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
