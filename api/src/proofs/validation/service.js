const proofExists = require('./proof-exists');
const hasDriverAndPassenger = require('./has-driver-and-passenger');

// require tests above and add here
const tests = {
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
  ...tests,
};

module.exports = validationService;
