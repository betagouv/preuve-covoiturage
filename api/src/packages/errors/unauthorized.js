const UnauthorizedError = function UnauthorizedError(message = 'Unauthorized') {
  this.message = message;
};

UnauthorizedError.prototype = new Error();
UnauthorizedError.prototype.name = 'UnauthorizedError';

module.exports = UnauthorizedError;
