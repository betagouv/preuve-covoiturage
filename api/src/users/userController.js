const router = require("express").Router();
const User = require("./userModel");

router.get("/", async (req, res) => {
  const query = {};

  res.json(await User.find(query));
});

router.post("/", async (req, res) => {
  res.json({ todo: 'create user' });
});

router.get("/me", (req, res) => {
  res.json({
    user: req.user
  });
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    res.json(await User.find({ _id: id }));
  }
);

router.put("/:id", async (req, res) => {
  res.json({ todo: 'update user' });
});

router.delete("/:id", async (req, res) => {
  res.json({ todo: 'delete user' });
});

// FIX ME
// router.put("/user", async (req, res) => {
//     const { fname, lname } = req.body;
//     if (!fname || !lname) {
//       return res.status(400).json({
//         success: false,
//         msg: "Le nom et le prénom ne doivent pas être vides."
//       });
//     }
//     const user = await User.findOneAndUpdate(
//       { _id: req.user._id },
//       { $set: { lastname: lname, firstname: fname } },
//       { new: true }
//     );
//     res.json({ success: true, user });
//   }
// );

// FIX ME
// router.post("/updatePassword", (req, res) => {
//   const { email, ppwd, pwd1, pwd2 } = req.body;
//
//   if (!pwd1) {
//     return res.status(401).json({
//       success: false,
//       msg: `Le nouveau mot de passe ne peut être vide`
//     });
//   }
//
//   if (pwd1 !== pwd2) {
//     return res.status(401).json({
//       success: false,
//       msg: `Les mots de passe ne sont pas identiques`
//     });
//   }
//
//   User.findOne({ email }, function (err, user) {
//     if (err) throw err;
//
//     if (!user) {
//       res.status(401).json({
//         success: false,
//         msg: `La mise à jour du mot de passe a échouée. Utilisateur ${email} introuvable.`
//       });
//     } else {
//       user.comparePassword(ppwd, function (err, isMatch) {
//         if (isMatch && !err) {
//           user.set({ password: pwd1 });
//           user.set({ hasResetPassword: true });
//           user.save(function (err) {
//             if (err) throw err;
//             return res.status(200).json({
//               success: true,
//               msg: `La mise à jour du mot de passe a été effectuée avec succès`
//             });
//           });
//         } else {
//           res.status(401).json({
//             success: false,
//             msg: `La mise à jour du mot de passe a échouée. Utilisateur introuvable`
//           });
//         }
//       });
//     }
//   });
// });

module.exports = router;
