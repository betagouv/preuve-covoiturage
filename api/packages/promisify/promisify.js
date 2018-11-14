/**
 * Convert a callback to a Promise with arguments
 *
 * Example:
 *
 * const promisify = require("@pdc/promisify");
 * async myCoolFunction() {
 *   return await promisify(originalFunction, arg1, arg2, argN);
 * }
 *
 * @param fn
 * @param args
 * @returns {Promise<any>}
 */
module.exports = function promisify(fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, (err, ...rest) => {
      if (err) {
        reject(err);
      } else {
        resolve(...rest);
      }
    })
  });
};
