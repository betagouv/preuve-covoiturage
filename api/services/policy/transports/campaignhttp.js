const _ = require('lodash');
const moment = require('moment');
const router = require('express').Router();
const ForbiddenError = require('@pdc/shared/packages/packages/errors/forbidden');
const UnauthorizedError = require('@pdc/shared/packages/errors/unauthorized');
const policiesService = require('../policies/service');
const campaignService = require('./service');
const can = require('../../../middlewares/can');
const { apiUrl } = require('@pdc/shared/packages/url/url');
const { processCampaign } = require('../../../incentive/kernel');

/**
 * get an Campaign by ID
 */
router.get('/:id', can('incentive-campaign.read'), async (req, res, next) => {
  try {
    res.json(await campaignService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

/**
 * List all Campaigns
 */
router.get('/', can('incentive-campaign.list'), async (req, res, next) => {
  // filter by AOM

  try {
    res.json(await campaignService.find(req.query));
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new Campaign
 */
router.post('/', can('incentive-campaign.create'), async (req, res, next) => {
  try {
    // fill policies
    req.body.policies = await policiesService.fillPoliciesParametered(req.body.policies);

    const aom = _.get(req, 'user.aom');

    if (!aom) {
      throw new ForbiddenError('Your are not an AOM!');
    }

    const campaign = await campaignService.create({
      ...req.body,
      aom,
    });

    res
      .set('Location', apiUrl(`incentive/campaigns/${campaign._id.toString()}`))
      .status(201)
      .json(campaign);
  } catch (e) {
    next(e);
  }
});

/**
 * Create a new Campaign
 */
router.post('/simulation', can('incentive-campaign.create'), async (req, res, next) => {
  try {
    // fill policies
    req.body.policies = await policiesService.fillPoliciesParametered(req.body.policies);

    const aom = _.get(req, 'user.aom');

    if (!aom) {
      throw new ForbiddenError('Your are not an AOM!');
    }

    const campaign = {
      ...req.body,
      aom,
      start: moment().subtract(1, 'month').startOf('month'),
      end: moment().subtract(1, 'month').endOf('month'),
      status: 'active',
    };

    const incentives = await processCampaign(campaign);

    res
      .status(200)
      .json(
        incentives
          .map(incentive => ({
            unit_id: incentive.unit._id,
            unit_financial: incentive.unit.financial,
            unit_name: incentive.unit.name,
            unit_short_name: incentive.unit.short_name,
            amount: incentive.amount,
            trip: 1,
          }))
          .reduce(
            (acc, incentive) => {
              let unitData = acc.find(unit => unit._id === incentive._id);

              if (!unitData) {
                unitData = {
                  ...incentive,
                };

                acc.push(unitData);
              }

              unitData.amount += incentive.amount;
              unitData.trip += 1;

              return acc;
            },
            [],
          ),
      );
  } catch (e) {
    next(e);
  }
});

module.exports = router;
