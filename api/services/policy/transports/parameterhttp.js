const _ = require('lodash');
const router = require('express').Router();
const can = require('@pdc/shared/middlewares/can');
const incentivePolicyService = require('../policy');

// /**
//  * get an Parameter by ID
//  */
// router.get('/:id', can('incentive-parameter.read'), async (req, res, next) => {
//   try {
//     res.json(await incentiveParameterService.find({ _id: req.params.id }));
//   } catch (e) {
//     next(e);
//   }
// });

/**
 * List all Parameters
 */
router.get('/', can('incentive-parameter.list'), async (req, res, next) => {
  // filter by AOM
  const aom = _.get(req, 'user.aom');
  if (aom) {
    req.query.filter = _.assign(req.query.filter, { aom });
  }


  try {
    res.json(await incentivePolicyService.findParameters(req.query.filter));
  } catch (e) {
    next(e);
  }
});


module.exports = router;
