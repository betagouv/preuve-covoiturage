const router = require('express').Router();
const incentiveParameterService = require('./service');
const can = require('../../../middlewares/can');
const { apiUrl } = require('../../../packages/url/url');

/**
 * get an Parameter by ID
 */
router.get('/:id', can('incentive-parameter.read'), async (req, res, next) => {
  try {
    res.json(await incentiveParameterService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * update an Parameter by ID
 */
router.put('/:id', can('incentive-parameter.update'), async (req, res, next) => {
  // if not used by other aom

  try {
    res.json(await incentiveParameterService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an Parameter
 */
router.delete('/:id', can('incentive-parameter.delete'), async (req, res, next) => {
  // if not used by other aom

  try {
    res.json({
      id: req.params.id,
      deleted: !!await incentiveParameterService.delete(req.params.id),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * List all Parameters
 */
router.get('/', can('incentive-parameter.list'), async (req, res, next) => {
  try {
    res.json(await incentiveParameterService.find(req.query));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new Parameter
 */
router.post('/', can('incentive-parameter.create'), async (req, res, next) => {
  try {
    const parameter = await incentiveParameterService.create(req.body);

    res
      .set('Location', apiUrl(`incentive/parameters/${parameter._id.toString()}`))
      .status(201)
      .json(parameter);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
