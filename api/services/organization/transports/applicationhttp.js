const _ = require('lodash');
const router = require('express').Router();
const BadRequestError = require('@pdc/shared/packages/errors/bad-request');
const can = require('@pdc/shared/middlewares/can');

const applicationService = require('../application');

/**
 * Delete an application
 */
router.delete('/:id', can('operator.app.delete'), async (req, res, next) => {
  try {
    res.json({
      id: req.params.id,
      deleted: !!await applicationService.delete(_.get(req.user, 'operator'), req.params.id),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * List all applications
 */
router.get('/', can('operator.app.list'), async (req, res, next) => {
  try {
    res.json(await applicationService.find(_.get(req.user, 'operator')));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new application
 */
router.post('/', can('operator.app.create'), async (req, res, next) => {
  try {
    const operator = _.get(req.user, 'operator', req.body.operator);

    if (!operator) {
      throw new BadRequestError('Missing operator ID');
    }

    const app = await applicationService.create(operator, req.body);

    res
      .status(201)
      .json(app);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
