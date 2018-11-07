const { PORT } = require("./config.js");
const server = require('./server');

require('./mongo');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.use("/auth", require("./controllers/auth"));
server.use("/users", require("./controllers/users"));

server.listen(PORT, function () {
  console.log('%s listening at %s', server.name, server.url);
});
