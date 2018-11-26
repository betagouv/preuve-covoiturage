const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const generator = require('generate-password');
const config = require('../config.js');

const User = require('../users/user-model');

require('../passport')(passport);

router.get('/ping', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({});
});

router.post('/signin', (req, res) => {
  const failMessage = {
    success: false,
    msg: 'L\'authentification a échoué. Email ou mot de passe incorrect.',
  };

  User.findOne(
    { email: req.body.email },
    (err, user) => {
      if (err) throw err;

      if (!user) {
        res.status(401).json(failMessage);
      } else {
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            const token = jwt.sign({ _id: user._id }, config.secret, {
              expiresIn: '1d',
            });
            user.set({ lastConnectedAt: Date.now() });
            user.save();
            res.json({
              success: true,
              token,
              user,
            });
          } else {
            res.status(401).json(failMessage);
          }
        });
      }
    },
  );
});

router.post('/signup', (req, res) => {
  if (
    !req.body.email
    || !req.body.group
    || !req.body.role
  ) {
    res.status(400).json({
      success: false,
      msg: 'Email, groupe ou role absent',
    });

    return;
  }

  const password = req.body.password
    ? req.body.password
    : generator.generate({
      length: 12,
      numbers: true,
      symbols: true,
    });

  const newUser = new User({
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    email: req.body.email,
    group: req.body.group,
    role: req.body.role,
    password,
    hasResetPassword: false,
  });

  newUser.save((err) => {
    if (err) {
      console.log('signup', err);
      let failMessage = {};

      switch (err.code) {
        // email dup key
        case 11000:
          failMessage = {
            success: false,
            msg: 'Utilisateur déjà enregistré',
          };
          break;

        default:
          failMessage = {
            success: false,
            msg: err.errmsg,
          };
      }

      res.status(400).json(failMessage);
    } else {
      res.json({
        success: true,
        msg: 'Nouvel utilisateur créé',
      });
    }
  });
});

router.post('/forgetPassword', (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.status(401).json({
        success: false,
        msg: `Utilisateur ${email} introuvable`,
      });
    } else {
      const password = generator.generate({ length: 10, numbers: true });
      user.set({ password });

      user.save((err2) => {
        if (err2) throw err;
        res.json({
          success: true,
          msg: 'Mot de passe modifié',
        });
      });
    }
  });
});

module.exports = router;
