function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const response = {
    tz: new Date().toISOString(),
    type: err.name,
    code: err.status || 500,
    message: err.message,
  };

  switch (response.type) {
    case 'InvalidParamsError':
      response.code = 400;
      response.message = JSON.parse(response.message);
      res.status(400);
      res.json(response);
      break;

    case 'InvalidTokenError':
      response.code = 401;
      response.message = JSON.parse(response.message);
      res.status(401);
      res.json(response);
      break;

    default:
      res.status(response.code);
      res.json(response);
  }

  console.log(response);
}

module.exports = { errorHandler };
