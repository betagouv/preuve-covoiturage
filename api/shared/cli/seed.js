const mongoose = require('mongoose');
const { mongoUrl } = require('../config');
const seeder = require('../entities/seeder');

(async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    await seeder(process.env.NODE_ENV);

    await mongoose.disconnect();
    process.exit();
  } catch (e) {
    process.exit(1);
  }
})();
