// tslint:disable max-classes-per-file
class BadRequestError extends Error {}
class ConflictError extends Error {}
class ForbiddenError extends Error {}
class InternalServerError extends Error {}
class NotFoundError extends Error {}
class UnauthorizedError extends Error {}

export {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
};
