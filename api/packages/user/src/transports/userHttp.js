const router = require('express').Router();
const { NotFoundError } = require('@pdc/shared-errors');
const { can } = require('@pdc/shared-middlewares');
const { apiUrl } = require('@pdc/shared-helpers').url(process.env.APP_URL, process.env.API_URL);
const userService = require('../service');

router.post('/invite', can('user.invite'), async (req, res, next) => {
  try {
    res.json(await userService.create(req.body, req.user, true));
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
    const user = await userService.create(req.body, req.user);
    res
      .set('Location', apiUrl(`users/${user._id.toString()}`))
      .status(201)
      .json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
