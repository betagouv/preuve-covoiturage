/* eslint-disable camelcase,no-console */
const mongoose = require('mongoose');
const { mongoUrl } = require('@pdc/shared-config');
const journeysQueue = require('../queue');
const Journey = require('../entities/models/journey');

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
      args = (await Journey.find({
        trip_id: { $exists: false },
      }, { _id: 1 }).exec())
        .map(i => i._id.toString());
    }

    const processes = [];
    args.forEach((journey_id) => {
      if (!ObjectId.isValid(journey_id)) return;
      console.log(`add ${journey_id}`);
      processes.push(journeysQueue.add(`CLI process trip - ${journey_id}`, {
        type: 'process-trip',
        journey_id,
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
