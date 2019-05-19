const statsQueue = require('../queue');

module.exports = {
  calculate({ key, collection, commands }) {
    statsQueue.add(`${key} - calculate`, {
      key,
      collection,
      commands,
      type: 'calculate',
    });
  },
};
