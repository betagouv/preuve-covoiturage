const router = require('express').Router();
const can = require('@pdc/shared/middlewares/can');
const userService = require('../service');

// show my profile
router.get('/', can('profile.read'), (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (e) {
    next(e);
  }
});

// update my profile
router.put('/', can('profile.update'), async (req, res, next) => {
  try {
    res.json(await userService.update(req.user._id, req.body));
  } catch (e) {
    next(e);
  }
});

// update my profile
router.post('/password', can('profile.password'), async (req, res, next) => {
  try {
    res.json(await userService.changePassword(req.user._id, req.body));
  } catch (e) {
    next(e);
  }
});

// delete my profile
router.delete('/', can('profile.delete'), async (req, res, next) => {
  try {
    res.json({ todo: 'delete current user profile' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
