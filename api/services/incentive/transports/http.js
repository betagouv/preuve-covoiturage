const router = require('express').Router();
const can = require('@pdc/shared/middlewares/can');
const incentiveService = require('../service');

/**
 * get an Incentive by ID
 */
router.get('/:id', can('incentive.read'), async (req, res, next) => {
  try {
    res.json(await incentiveService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

// /**
//  * update an Incentive by ID
//  */
// router.put('/:id', can('incentive.update'), async (req, res, next) => {
//
//   try {
//     res.json(await incentiveService.update(req.params.id, req.body));
//   } catch (e) {
//     next(e);
//   }
// });

// /**
//  * Soft delete or force delete an Incentive
//  */
// router.delete('/:id', can('incentive.delete'), async (req, res, next) => {
//
//
//   try {
//     res.json({
//       id: req.params.id,
//       deleted: !!await incentiveService.delete(req.params.id),
//     });
//   } catch (e) {
//     next(e);
//   }
// });

/**
 * List all Incentives
 */
router.get('/', can('incentive.list'), async (req, res, next) => {
  // filter by AOM

  try {
    res.json(await incentiveService.find(req.query));
  } catch (e) {
    next(e);
  }
});

// /**
//  * Create a new Incentive
//  */
// router.post('/', can('incentive.create'), async (req, res, next) => {
//   try {
//     const incentive = await incentiveService.create(req.body);
//
//     res
//       .set('Location', apiUrl(`incentives/${incentive._id.toString()}`))
//       .status(201)
//       .json(incentive);
//   } catch (e) {
//     next(e);
//   }
// });

module.exports = router;
