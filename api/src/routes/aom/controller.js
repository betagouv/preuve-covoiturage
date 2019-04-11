const router = require('express').Router();
const aomService = require('./service');
const can = require('../../middlewares/can');
const { apiUrl } = require('../../packages/url/url');

/**
 * Add a user to an aom
 */
router.post('/:id/users/add', can('aom.users.add'), async (req, res, next) => {
  try {
    res.json(await aomService.addUser(req.params.id, req.body.user));
  } catch (e) {
    next(e);
  }
});

/**
 * Remove a user to an aom
 */
router.post('/:id/users/remove', can('aom.users.remove'), async (req, res, next) => {
  try {
    res.json(await aomService.removeUser(req.params.id, req.body.user));
  } catch (e) {
    next(e);
  }
});

/**
 * List all users from an aom
 */
router.get('/:id/users', can('aom.users.list'), async (req, res, next) => {
  try {
    res.json(await aomService.users(req.params.id));
  } catch (e) {
    next(e);
  }
});

/**
 * get an AOM by ID
 */
router.get('/:id', can('aom.read'), async (req, res, next) => {
  try {
    res.json(await aomService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * update an AOM by ID
 */
router.put('/:id', can('aom.update'), async (req, res, next) => {
  try {
    res.json(await aomService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an AOM
 */
router.delete('/:id', can('aom.delete'), async (req, res, next) => {
  try {
    res.json({
      id: req.params.id,
      deleted: !!await aomService.delete(req.params.id),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * List all AOMs
 */
router.get('/', can('aom.list'), async (req, res, next) => {
  try {
    res.json(await aomService.find(req.query));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new AOM
 */
router.post('/', can('aom.create'), async (req, res, next) => {
  try {
    const aom = await aomService.create(req.body);

    res
      .set('Location', apiUrl(`aom/${aom._id.toString()}`))
      .status(201)
      .json(aom);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
