const BadRequestError = function BadRequestError(message = 'Bad Request') {
  this.message = message;
};

BadRequestError.prototype = new Error();
BadRequestError.prototype.name = 'BadRequestError';

module.exports = BadRequestError;
