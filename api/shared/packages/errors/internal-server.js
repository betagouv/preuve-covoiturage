const InternalServerError = function InternalServerError(message = 'Internal server error') {
  this.message = message;
};

InternalServerError.prototype = new Error();
InternalServerError.prototype.name = 'InternalServerError';

module.exports = InternalServerError;
