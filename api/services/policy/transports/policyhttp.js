const _ = require('lodash');
const router = require('express').Router();
const can = require('@pdc/shared/middlewares/can');
const { apiUrl } = require('@pdc/shared/packages/url/url');
const policyService = require('../policy');

/**
 * get an Policy by ID
 */
router.get('/:id', can('incentive-policy.read'), async (req, res, next) => {
  try {
    res.json(await policyService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * update an Policy by ID
 */
router.put('/:id', can('incentive-policy.update'), async (req, res, next) => {
  // if not used by other AOM

  try {
    res.json(await policyService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an Policy
 */
router.delete('/:id', can('incentive-policy.delete'), async (req, res, next) => {
  // if not used by other AOM -- find policy other aom

  try {
    res.json({
      id: req.params.id,
      deleted: !!await policyService.delete(req.params.id),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * List all Policys
 */
router.get('/', can('incentive-policy.list'), async (req, res, next) => {
  try {
    res.json(await policyService.find(req.query));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new Policy
 */
router.post('/', can('incentive-policy.create'), async (req, res, next) => {
  try {
    const aom = _.get(req, 'user.aom');
    const policy = await policyService.create({
      aom,
      ...req.body,
    });

    res
      .set('Location', apiUrl(`incentive/policies/${policy._id.toString()}`))
      .status(201)
      .json(policy);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
