const router = require('express').Router();
const incentiveUnitService = require('./service');
const can = require('../../../middlewares/can');
const { apiUrl } = require('../../../packages/url/url');

/**
 * get an Unit by ID
 */
router.get('/:id', can('incentive-unit.read'), async (req, res, next) => {
  try {
    res.json(await incentiveUnitService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * update an Unit by ID
 */
router.put('/:id', can('incentive-unit.update'), async (req, res, next) => {
  // if not used by other aom

  try {
    res.json(await incentiveUnitService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an Unit
 */
router.delete('/:id', can('incentive-unit.delete'), async (req, res, next) => {
  // if not used by other aom

  try {
    res.json({
      id: req.params.id,
      deleted: !!await incentiveUnitService.delete(req.params.id),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * List all Units
 */
router.get('/', can('incentive-unit.list'), async (req, res, next) => {
  try {
    res.json(await incentiveUnitService.find(req.query));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new Unit
 */
router.post('/', can('incentive-unit.create'), async (req, res, next) => {
  try {
    const unit = await incentiveUnitService.create(req.body);

    res
      .set('Location', apiUrl(`incentive/units/${unit._id.toString()}`))
      .status(201)
      .json(unit);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
