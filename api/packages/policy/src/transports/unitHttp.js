const _ = require('lodash');
const router = require('express').Router();
const { can } = require('@pdc/shared-middlewares');
const incentivePolicyService = require('../policy');

// /**
//  * get an Unit by ID
//  */
// router.get('/:id', can('incentive-unit.read'), async (req, res, next) => {
//   try {
//     res.json(await incentivePolicyService.findUnits({ _id: req.params.id }));
//   } catch (e) {
//     next(e);
//   }
// });

/**
 * List all Units
 */
router.get('/', can('incentive-unit.list'), async (req, res, next) => {
  // filter by AOM
  const aom = _.get(req, 'user.aom');
  if (aom) {
    req.query.filter = _.assign(req.query.filter, { aom });
  }

  try {
    res.json(await incentivePolicyService.findUnits(req.query.filter));
  } catch (e) {
    next(e);
  }
});


module.exports = router;
