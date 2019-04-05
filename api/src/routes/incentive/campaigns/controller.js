const router = require('express').Router();
const campaignService = require('./service');
const can = require('../../../middlewares/can');
const { apiUrl } = require('../../../packages/url/url');

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
 * update an Campaign by ID
 */
router.put('/:id', can('incentive-campaign.update'), async (req, res, next) => {
  // if campaign is draft

  try {
    res.json(await campaignService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

/**
 * Soft delete or force delete an Campaign
 */
router.delete('/:id', can('incentive-campaign.delete'), async (req, res, next) => {
  // if campaign is draft


  try {
    res.json({
      id: req.params.id,
      deleted: !!await campaignService.delete(req.params.id),
    });
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
    const campaign = await campaignService.create(req.body);

    res
      .set('Location', apiUrl(`incentive/campaigns/${campaign._id.toString()}`))
      .status(201)
      .json(campaign);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
