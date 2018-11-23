const router = require("express").Router();
const aomService = require("./aom-service");

/**
 * Add a user to an aom
 */
router.post("/:id/users/add", async (req, res, next) => {
  try {
    res.json(await aomService.addUser(req.params.id, req.body.user));
  } catch (e) {
    next(e);
  }
});

/**
 * Remove a user to an aom
 */
router.post("/:id/users/remove", async (req, res, next) => {
  try {
    res.json(await aomService.removeUser(req.params.id, req.body.user));
  } catch (e) {
    next(e);
  }
});

/**
 * List all users from an aom
 */
router.get("/:id/users", async (req, res, next) => {
  try {
    res.json(await aomService.users(req.params.id));
  } catch (e) {
    next(e);
  }
});

/**
 * get an AOM by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    res.json(await aomService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * update an AOM by ID
 */
router.put("/:id", async (req, res, next) => {
  try {
    res.json(await aomService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an AOM
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = aomService.delete(req.params.id, !!req.query.force);

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
 * List all AOMs
 */
router.get("/", async (req, res, next) => {
  try {
    res.json(await aomService.find({}));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new AOM
 */
router.post("/", async (req, res, next) => {
  try {
    res.json(await aomService.create(req.body));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
