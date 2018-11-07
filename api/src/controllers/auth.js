const server = require('../server');
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const generator = require("generate-password");
require("../passport")(passport);
const User = require("../models/user");
const config = require("../config.js");

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.post("/signup", (req, res) => {
  if (
    !req.body.email ||
    !req.body.group ||
    !req.body.role ||
    !req.body.institution
  ) {
    return res.status(400).json({
      success: false,
      msg: "Email, group, institution ou role absent"
    });
  }

  var password = generator.generate({
    length: 12,
    numbers: true,
    symbols: true
  });

  const newUser = new User({
    nom: req.body.nom,
    prenom: req.body.prenom,
    email: req.body.email,
    group: req.body.group,
    role: req.body.role,
    institution: req.body.institution,
    password,
    hasResetPassword: false
  });

  newUser.save(function(err) {
    if (err) {
      console.log("signup", err);
      return res.status(400).json({
        success: false,
        msg: `L'utilisateur ${req.body.email} existe déja`
      });
    }

    res.status(200).json({
      success: true,
      msg: "Successful created new user."
    });
  });
});

server.post("/forgetPassword", (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({
        success: false,
        msg: `Utilisateur ${email} introuvable`
      });
    } else {
      var password = generator.generate({ length: 10, numbers: true });
      user.set({ password });

      user.save(function(err) {
        if (err) throw err;
        res.status(200).json({
          success: true,
          msg: "Successful created new user."
        });
      });
    }
  });
});

server.post(
  "/updatePassword",
  (req, res) => {
    const { email, ppwd, pwd1, pwd2 } = req.body;

    if (!pwd1) {
      return res.status(401).send({
        success: false,
        msg: `Le nouveau mot de passe ne peut être vide`
      });
    }

    if (pwd1 !== pwd2) {
      return res.status(401).send({
        success: false,
        msg: `Les mots de passe ne sont pas identiques`
      });
    }

    User.findOne({ email }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).send({
          success: false,
          msg: `La mise à jour du mot de passe a échouée. Utilisateur ${email} introuvable.`
        });
      } else {
        user.comparePassword(ppwd, function(err, isMatch) {
          if (isMatch && !err) {
            user.set({ password: pwd1 });
            user.set({ hasResetPassword: true });
            user.save(function(err) {
              if (err) throw err;
              return res.status(200).send({
                success: true,
                msg: `La mise à jour du mot de passe a été effectuée avec succès`
              });
            });
          } else {
            res.status(401).send({
              success: false,
              msg: `La mise à jour du mot de passe a échouée. Utilisateur introuvable`
            });
          }
        });
      }
    });
  }
);

server.post(
  "/updateProfile", 
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { email, nom, prenom, institution, group, role } = req.body;

    if (!nom || !prenom || !institution || !group || !role) {
      return res.status(401).send({
        success: false,
        msg: `Les informations ne peuvent pas être vides`
      });
    }

    User.findOne({ email }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).send({
          success: false,
          msg: `La mise à jour de vos informations a échouée. Utilisateur ${email} introuvable.`
        });
      } else {
        try {
          user.set({ 
            institution,
            nom,
            prenom,
            group,
            role
          });
          user.save(function(err) {
            if (err) throw err;
            return res.status(200).send({
              success: true,
              msg: `La mise à jour de vos informations a été effectuée avec succès`
            });
          });
        } catch (e) {
          res.status(401).send({
            success: false,
            msg: `La mise à jour de vos informations a échoué`
          });
        }
      }
    });
  }
);

server.post("/signin", (req, res) => {
  const failMessage = {
    success: false,
    msg: `L'authentification a échouée. Email ou mot de passe incorrect.`
  };
  User.findOne(
    {
      email: req.body.email
    },
    function(err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).send(failMessage);
      } else {
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            const token = jwt.sign({ _id: user._id }, config.secret, {
              expiresIn: "1d"
            });
            user.set({ lastConnectedAt: Date.now() });
            user.save();
            res.status(200).send({
              success: true,
              token: "JWT " + token,
              user
            });
          } else {
            res.status(401).send(failMessage);
          }
        });
      }
    }
  );
});

server.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send({
      success: true,
      user: req.user
    });
  }
);

server.put(
  "/user",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { fname, lname } = req.body;
    if (!fname || !lname) {
      return res.status(400).send({
        success: false,
        msg: "Le nom et le prénom ne doivent pas être vide."
      });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { nom: fname, prenom: lname } },
      { new: true }
    );
    res.send({ success: true, user });
  }
);

module.exports = server;
