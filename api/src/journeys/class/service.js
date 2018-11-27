const hasDriver = require('./has-driver');
const hasPassenger = require('./has-passenger');

// require tests above and add here
const classTests = {
  hasDriver,
  hasPassenger
};

const classService = {
  setClass(results) {
    // set Class according to result
    if (
      false === results["has-driver"] ||
      false === results["has-passenger"]
    ) {
      return "A";
    }

    return null;
  },
  ...classTests,
};

module.exports = classService;
