// error handler - !! keep the next argument !!
// otherwise Express doesn't use it as error handler
// https://expressjs.com/en/guide/error-handling.html
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let output;

  switch (err.name) {
    case 'MongoError':
      switch (err.message.match(/^([A-Z0-9])+/)[0]) {
        case 'E11000':
          output = res.status(409);
          break;
        default:
          output = res.status(500);
      }
      break;

    case 'BadRequestError':
    case 'ValidationError':
      output = res.status(400);
      break;

    case 'UnauthorizedError':
      output = res.status(401);
      break;

    case 'ForbiddenError':
      output = res.status(403);
      break;

    case 'NotFoundError':
      output = res.status(404);
      break;

    case 'ConflictError':
      output = res.status(409);
      break;

    case 'InternalServerError':
      output = res.status(500);
      break;

    default:
      output = res.status(500);
  }

  output.json({ name: err.name, message: err.message });
};
