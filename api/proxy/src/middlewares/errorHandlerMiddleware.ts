import express = require('express');

// error handler - !! keep the next argument !!
// otherwise Express doesn't use it as error handler
// https://expressjs.com/en/guide/error-handling.html
// tslint:disable-next-line: no-default-export no-unused-var
export function errorHandlerMiddleware(
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) {
  let output: express.Response;

  switch (err.message) {
    case 'MongoError':
      switch (err.message.match(/^([A-Z0-9])+/)[0]) {
        case 'E11000':
          output = res.status(409);
          break;
        default:
          output = res.status(500);
      }
      break;

    case 'Bad Request Error':
    case 'Validation Error':
      output = res.status(400);
      break;

    case 'Unauthorized Error':
      output = res.status(401);
      break;

    case 'Forbidden':
      output = res.status(403);
      break;

    case 'Not Found':
      output = res.status(404);
      break;

    case 'Conflict':
      output = res.status(409);
      break;

    case 'Internal Server Error':
      output = res.status(500);
      break;

    default:
      output = res.status(500);
  }

  output.json({ name: err.name, message: err.message });
}
