/* eslint-disable camelcase,no-console */
const mongoose = require('mongoose');
const { mongoUrl } = require('@pdc/shared/config');
const journeysQueue = require('../queue');
const SafeJourney = require('../entities/models/safe-journey');

const { ObjectId } = mongoose.Types;

(async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    // eslint-disable-next-line no-unused-vars,prefer-const
    let [bin, path, ...args] = process.argv;

    if (!args.length) {
      args = (await SafeJourney.find({}, { _id: 1 }).exec())
        .map(i => i._id.toString());
    }

    const processes = [];
    args.forEach((safe_journey_id) => {
      if (!ObjectId.isValid(safe_journey_id)) return;
      console.log(`add ${safe_journey_id}`);
      processes.push(journeysQueue.add(`CLI process - ${safe_journey_id}`, {
        type: 'process',
        safe_journey_id,
      }));
    });

    await Promise.all(processes);

    await mongoose.disconnect();
    process.exit();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
})();
