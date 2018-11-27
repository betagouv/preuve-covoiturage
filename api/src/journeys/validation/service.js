
// require tests above and add here
const journeyValidationTests = {
};

const journeyValidationService = {
  isValid(results) {
    // TODO define if the tests make it a valid  or not
    if (results) {
      return true;
    }

    return false;
  },
  ...journeyValidationTests,
};

module.exports = journeyValidationService;
