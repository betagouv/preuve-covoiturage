const restify = require('restify');
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
// const { capture } = require("./sentry.js");

require("./passport")(passport);

const server = restify.createServer();

server.use(bodyParser.json({ limit: "50mb" }));

// secure apps by setting various HTTP headers
server.use(helmet());

// enable CORS - Cross Origin Resource Sharing
server.use(cors());

server.use(passport.initialize());
//
// function respond(req, res, next) {
//   res.send('hello ' + req.params.name);
//   next();
// }
//
// server.get('/hello/:name', respond);
// server.head('/hello/:name', respond);
//
// // app.get("/", (_req, res) => {
// //   res.send("POP API listening.");
// // });
// //
// server.use("/auth", require("./controllers/auth"));
// server.use("/users", require("./controllers/users"));
// // app.use("/import", require("./controllers/import"));
// //
// // //notices
// // app.use("/merimee", require("./controllers/merimee"));
// // app.use("/joconde", require("./controllers/joconde"));
// // app.use("/mnr", require("./controllers/mnr"));
// // app.use("/palissy", require("./controllers/palissy"));
// // app.use("/memoire", require("./controllers/memoire"));
// //
// // //proxy to GINCO API
// // app.use("/thesaurus", bodyParser.json(), require("./controllers/thesaurus"));
// //
// // //proxy to ES
// // app.use("/search", require("./controllers/search"));
// //
// // app.post(
// //   "/mail",
// //   passport.authenticate("jwt", { session: false }),
// //   (req, res) => {
// //     const { subject, to, body } = req.body;
// //     if (!subject || !to || !body) {
// //       capture("Mail information incomplete");
// //       res.status(500).send("Information incomplete");
// //       return;
// //     }
// //     Mailer.send(subject, to, body)
// //       .then(e => {
// //         return res.status(200).send({ success: true, msg: "OK" });
// //       })
// //       .catch(e => {
// //         console.log("ERROR", e);
// //         return res.status(200);
// //       });
// //   }
// // );
// //
// // app.listen(PORT, () => console.log("Listening on port " + PORT));
//

module.exports = server;
