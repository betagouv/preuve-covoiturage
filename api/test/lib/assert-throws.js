const assert = require('assert');

module.exports = async (errorType, func, ...args) => {
  try {
    await func(...args);
    throw new Error('Does not throw error');
  } catch (e) {
    if (typeof errorType === 'string') {
      assert.equal(errorType, e && e.message ? e.message : null);
    } else {
      assert(e instanceof errorType, e ? `[${e.name}] ${e.message}` : null);
    }
  }
};
