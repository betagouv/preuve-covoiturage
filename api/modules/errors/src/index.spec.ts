import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from './index';

const boom = (errorClass) => () => {
  const fn = () => {
    throw new errorClass();
  };

  expect(fn).to.throw(errorClass);
};

describe('errors', () => {
  it('BadRequestError', boom(BadRequestError));
  it('ConflictError', boom(ConflictError));
  it('ForbiddenError', boom(ForbiddenError));
  it('InternalServerError', boom(InternalServerError));
  it('NotFoundError', boom(NotFoundError));
  it('UnauthorizedError', boom(UnauthorizedError));
});
