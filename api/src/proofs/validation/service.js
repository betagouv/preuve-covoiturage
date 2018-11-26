const proofExists = require('./proof-exists');

// require tests above and add here
const tests = {
  proofExists,
};

const validationService = {
  isValid(results) {
    // TODO define if the tests make it a valid proof or not
    if (results) {
      return true;
    }

    return false;
  },
  ...tests,
};

module.exports = validationService;
