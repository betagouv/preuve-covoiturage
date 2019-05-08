const ConflictError = function ConflictError(message = 'Conflict') {
  this.message = message;
};

ConflictError.prototype = new Error();
ConflictError.prototype.name = 'ConflictError';

module.exports = ConflictError;
