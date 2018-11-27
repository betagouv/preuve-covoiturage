const proofExists = require('./proof-exists');

// require tests above and add here
const proofValidationTests = {
  proofExists
};

const proofValidationService = {
  isValid(results) {
    // TODO define if the tests make it a valid proof or not
    if (
      false === results["proof-exists"]
    ) {
      return false;
    }

    if (results) {
      return true;
    }

    return false;
  },
  ...proofValidationTests,
};

module.exports = proofValidationService;
