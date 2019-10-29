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
  let code: number;

  switch (err.message) {
    case 'MongoError':
      switch (err.message.match(/^([A-Z0-9])+/)[0]) {
        case 'E11000':
          code = 409;
          break;
        default:
          code = 500;
      }
      break;

    case 'Bad Request Error':
    case 'Validation Error':
      code = 400;
      break;

    case 'Unauthorized Error':
      code = 401;
      break;

    case 'Forbidden':
      code = 403;
      break;

    case 'Not Found':
      code = 404;
      break;

    case 'Conflict':
      code = 409;
      break;

    case 'Internal Server Error':
      code = 500;
      break;

    default:
      code = 500;
  }
  console.error(err.name, err.message);
  res.status(code).json({
    id: 1,
    jsonrpc: '2.0',
    error: { code, data: err.name, message: err.message },
  });
}
