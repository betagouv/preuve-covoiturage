const _ = require('lodash');
const router = require('express').Router();
const can = require('@pdc/shared/middlewares/can');
const { apiUrl } = require('@pdc/shared/helpers/url/url')(process.env.APP_URL, process.env.API_URL);
const policyService = require('../policy.service');

/**
 * get an Policy by ID
 */
router.get('/:id', can('incentive-policy.read'), async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    const aom = _.get(req, 'user.aom', null);
    if (aom) {
      query.aom = aom;
    }

    res.json(await policyService.find(query));
  } catch (e) {
    next(e);
  }
});

/**
 * List all Policys
 */
router.get('/', can('incentive-policy.list'), async (req, res, next) => {
  try {
    const { query } = req;
    const aom = _.get(req, 'user.aom', null);
    if (aom) {
      query.aom = aom;
    }

    res.json(await policyService.find(query));
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
