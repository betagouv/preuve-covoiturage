const ConflictError = function ConflictError(message = 'Conflict') {
  this.message = message;
};

ConflictError.prototype = new Error();
ConflictError.prototype.name = 'ConflictError';

export default ConflictError;
