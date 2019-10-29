import express = require('express');

// error handler - !! keep the next argument !!
// otherwise Express doesn't use it as error handler
// https://expressjs.com/en/guide/error-handling.html
// tslint:disable-next-line: no-default-export no-unused-var
export function errorHandlerMiddleware(
  err: Error,
  _req: express.Request,
  _res: express.Response,
  _next: express.NextFunction,
) {
  console.error(err);
}
