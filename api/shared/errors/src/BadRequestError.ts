// const BadRequestError = function BadRequestError(message = 'Bad Request') {
//   this.message = message;
// };

// BadRequestError.prototype = new Error();
// BadRequestError.prototype.name = 'BadRequestError';

// export default BadRequestError;

export class BadRequestError extends Error {

}
