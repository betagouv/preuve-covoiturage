const ForbiddenError = function ForbiddenError(message = 'Forbidden') {
  this.message = message;
};

ForbiddenError.prototype = new Error();
ForbiddenError.prototype.name = 'ForbiddenError';

export default ForbiddenError;
