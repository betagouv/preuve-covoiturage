const path = require('path');
const arena = require('bull-arena');
const passport = require('passport');
const router = require('express').Router();
const LocalStrategy = require('passport-local').Strategy;
const { redisObject } = require('../../config');
const User = require('../users/model');

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await User.findOne({
    email: username,
    group: 'registry',
    role: 'admin',
  }).exec();

  if (!user) {
    done(new Error('Not Found'));
  }

  const ok = await user.comparePassword(password);

  if (ok) done(null, user);
  else done(new Error('Wrong credentials'));
}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      cb(err);
    } else {
      cb(null, user);
    }
  });
});

router.get('/login', async (req, res, next) => {
  try {
    res.sendFile(path.resolve(__dirname, 'views/login.html'));
  } catch (e) {
    next(e);
  }
});

router.get('/logout', async (req, res, next) => {
  try {
    req.logout();
    res.redirect('/arena/login');
  } catch (e) {
    next(e);
  }
});

router.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/arena',
  failureRedirect: '/arena/login',
}));

router.use('/',
  // authenticate the user
  (req, res, next) => {
    if (req.isAuthenticated() || process.env.NODE_ENV === 'local') {
      next();
    } else {
      res.redirect('/arena/login');
    }
  },
  arena({
    queues: [
      {
        name: `${process.env.NODE_ENV}-journeys`,
        hostId: 'redis',
        redis: redisObject,
      },
      {
        name: `${process.env.NODE_ENV}-emails`,
        hostId: 'redis',
        redis: redisObject,
      },
    ],
  }, {
    basePath: '/',
    disableListen: true,
  }));

module.exports = router;
