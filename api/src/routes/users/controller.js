const router = require('express').Router();
const userService = require('./service');
const NotFoundError = require('../../packages/errors/not-found');
const can = require('../../middlewares/can');
const { apiUrl } = require('../../packages/url/url');

router.post('/invite', can('user.invite'), async (req, res, next) => {
  try {
    const data = {};

    data.email = req.body.email;
    data.firstname = req.body.firstname;
    data.lastname = req.body.lastname;
    data.role = req.body.role;
    data.requester = req.user.fullname;

    if (req.user.operator) {
      data.operator = req.user.operator;
    } else if (req.user.aom) {
      data.aom = req.user.aom;
    }

    res.json(await userService.invite(data));
  } catch (e) {
    next(e);
  }
});

router.get('/:id/options', can('user.read'), async (req, res, next) => {
  try {
    res.json(await userService.getOptions(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post('/:id/options', can('user.read'), async (req, res, next) => {
  try {
    res.json(await userService.setOption(req.params.id, req.body.key, req.body.value));
  } catch (e) {
    next(e);
  }
});

router.get('/:id/options/:key', can('user.read'), async (req, res, next) => {
  try {
    res.json(await userService.getOption(req.params.id, req.params.key));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id/options/:key', can('user.read'), async (req, res, next) => {
  try {
    res.json(await userService.deleteOption(req.params.id, req.params.key));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', can('user.read'), async (req, res, next) => {
  try {
    const user = await userService.findOne(req.params.id);

    if (!user) {
      throw new NotFoundError();
    }

    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', can('user.update'), async (req, res, next) => {
  try {
    res.json(await userService.update(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', can('user.delete'), async (req, res, next) => {
  try {
    userService.delete(req.params.id);

    res.json({ id: req.params.id });
  } catch (e) {
    next(e);
  }
});

router.get('/', can('user.list'), async (req, res, next) => {
  try {
    res.json(await userService.find(req.query));
  } catch (e) {
    next(e);
  }
});

router.post('/', can('user.create'), async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res
      .set('Location', apiUrl(`users/${user._id.toString()}`))
      .status(201)
      .json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
