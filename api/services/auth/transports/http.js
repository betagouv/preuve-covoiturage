const _ = require('lodash');
const router = require('express').Router();
const passport = require('passport');
const jwtUser = require('@pdc/shared/middlewares/jwt-user');
const jwtServer = require('@pdc/shared/middlewares/jwt-server');
const userService = require('@pdc/service-user/service');

require('@pdc/shared/packages/passport/passport')(passport);

router.get('/ping', jwtUser, (req, res, next) => {
  try {
    res.json({});
  } catch (e) {
    next(e);
  }
});

router.get('/server-ping', jwtServer, (req, res, next) => {
  try {
    res.json({
      id: _.get(req, 'operator._id'),
      name: _.get(req, 'operator.nom_commercial'),
      permissions: _.get(req, 'permissions'),
    });
  } catch (e) {
    next(e);
  }
});

router.get('/check', jwtUser, (req, res, next) => {
  try {
    res.json(req.user);
  } catch (e) {
    next(e);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    res.json(await userService.signin(req.body));
  } catch (e) {
    next(e);
  }
});

router.post('/forgotten', async (req, res, next) => {
  try {
    res.json(await userService.forgottenPassword(req.body));
  } catch (e) {
    next(e);
  }
});

router.post('/reset', async (req, res, next) => {
  try {
    res.json(await userService.resetPassword(req.body));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
