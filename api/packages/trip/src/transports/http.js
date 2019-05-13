const router = require('express').Router();
const { can } = require('@pdc/shared-middlewares');
const tripService = require('../service');
// const { apiUrl } = require('@pdc/shared/providers/url/url');

router.get('/:id', can('trip.read'), async (req, res, next) => {
  try {
    res.json(await tripService.find({ _id: req.params.id }));
  } catch (e) {
    next(e);
  }
});

// router.put('/:id', can('trip.update'), async (req, res, next) => {
//   try {
//     res.json(await tripService.update(req.params.id, req.body));
//   } catch (e) {
//     next(e);
//   }
// });
//
// router.delete('/:id', can('trip.delete'), async (req, res, next) => {
//   try {
//     res.json({
//       id: req.params.id,
//       deleted: !!await tripService.delete(req.params.id),
//     });
//   } catch (e) {
//     next(e);
//   }
// });

router.get('/', can('trip.list'), async (req, res, next) => {
  try {
    res.json(await tripService.find(req.query));
  } catch (e) {
    next(e);
  }
});

// router.post('/', can('trip.create'), async (req, res, next) => {
//   try {
//     const trip = await tripService.create(req.body);
//
//     res
//       .set('Location', apiUrl(`trips/${trip._id.toString()}`))
//       .status(201)
//       .json(trip);
//   } catch (e) {
//     next(e);
//   }
// });

module.exports = router;
