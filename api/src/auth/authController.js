const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const generator = require("generate-password");
require("../passport")(passport);
const User = require("../users/userModel");
const config = require("../config.js");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/ping", passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.json({});
});

router.post("/signup", (req, res) => {
  if (
    !req.body.email ||
    !req.body.group ||
    !req.body.role
  ) {
    return res.status(400).json({
      success: false,
      msg: "Email, groupe ou role absent"
    });
  }

  const password = req.body.password
    ? req.body.password
    : generator.generate({
      length: 12,
      numbers: true,
      symbols: true
    });

  const newUser = new User({
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    email: req.body.email,
    group: req.body.group,
    role: req.body.role,
    password,
    hasResetPassword: false
  });

  newUser.save(function (err) {
    if (err) {
      console.log("signup", err);

      switch (err.code) {
        // email dup key
        case 11000:
          failMessage = {
            success: false,
            msg: "Utilisateur déjà enregistré",
          };
          break;

        default:
          failMessage = {
            success: false,
            msg: err.errmsg,
          };
      }

      return res.status(400).json(failMessage);
    }

    res.status(200).json({
      success: true,
      msg: "Nouvel utilisateur créé"
    });
  });
});

router.post("/forgetPassword", (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({
        success: false,
        msg: `Utilisateur ${email} introuvable`
      });
    } else {
      const password = generator.generate({ length: 10, numbers: true });
      user.set({ password });

      user.save(function (err) {
        if (err) throw err;
        res.status(200).json({
          success: true,
          msg: "Mot de passe modifié"
        });
      });
    }
  });
});

router.post(
  "/updatePassword",
  (req, res) => {
    const { email, ppwd, pwd1, pwd2 } = req.body;

    if (!pwd1) {
      return res.status(401).json({
        success: false,
        msg: `Le nouveau mot de passe ne peut être vide`
      });
    }

    if (pwd1 !== pwd2) {
      return res.status(401).json({
        success: false,
        msg: `Les mots de passe ne sont pas identiques`
      });
    }

    User.findOne({ email }, function (err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).json({
          success: false,
          msg: `La mise à jour du mot de passe a échouée. Utilisateur ${email} introuvable.`
        });
      } else {
        user.comparePassword(ppwd, function (err, isMatch) {
          if (isMatch && !err) {
            user.set({ password: pwd1 });
            user.set({ hasResetPassword: true });
            user.save(function (err) {
              if (err) throw err;
              return res.status(200).json({
                success: true,
                msg: `La mise à jour du mot de passe a été effectuée avec succès`
              });
            });
          } else {
            res.status(401).json({
              success: false,
              msg: `La mise à jour du mot de passe a échouée. Utilisateur introuvable`
            });
          }
        });
      }
    });
  }
);

router.post(
  "/updateProfile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { email, lastname, firstname, group, role } = req.body;

    if (!lastname || !firstname || !group || !role) {
      return res.status(401).json({
        success: false,
        msg: `Les informations ne peuvent pas être vides`
      });
    }

    User.findOne({ email }, function (err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).json({
          success: false,
          msg: `La mise à jour de vos informations a échouée. Utilisateur ${email} introuvable.`
        });
      } else {
        try {
          user.set({
            lastname,
            firstname,
            group,
            role
          });
          user.save(function (err) {
            if (err) throw err;
            return res.status(200).json({
              success: true,
              msg: `La mise à jour de vos informations a été effectuée avec succès`
            });
          });
        } catch (e) {
          res.status(401).json({
            success: false,
            msg: `La mise à jour de vos informations a échoué`
          });
        }
      }
    });
  }
);

router.post("/signin", (req, res) => {
  const failMessage = {
    success: false,
    msg: `L'authentification a échoué. Email ou mot de passe incorrect.`
  };
  User.findOne(
    { email: req.body.email },
    function (err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).json(failMessage);
      } else {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            const token = jwt.sign({ _id: user._id }, config.secret, {
              expiresIn: "1d"
            });
            user.set({ lastConnectedAt: Date.now() });
            user.save();
            res.status(200).json({
              success: true,
              token,
              user
            });
          } else {
            res.status(401).json(failMessage);
          }
        });
      }
    }
  );
});

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  }
);

router.put(
  "/user",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { fname, lname } = req.body;
    if (!fname || !lname) {
      return res.status(400).json({
        success: false,
        msg: "Le nom et le prénom ne doivent pas être vides."
      });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { lastname: lname, firstname: fname } },
      { new: true }
    );
    res.json({ success: true, user });
  }
);

module.exports = router;
