/* eslint-disable no-console */
const _ = require('lodash');
const mongoose = require('mongoose');
const { mongoUrl } = require('../src/config');
const Permissions = require('../src/packages/permissions');
const User = require('../src/routes/users/model');

(async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    /**
     * Apply configured permissions to users differing from it
     * This should catch all updates in the config.
     *
     * ! It will not allow a fine configuration of the permissions
     * for each user.
     *
     * @type {Array}
     */
    const promises = [];
    const users = await User.find({}).exec();
    users.forEach((user) => {
      const { _id, email, role, group, permissions } = user;
      const confPerms = Permissions.getFromRole(group, role);
      if (_.difference(permissions, confPerms).length !== 0) {
        console.log(_id.toString(), email, _.difference(permissions, confPerms));

        promises.push(User.findByIdAndUpdate({
          _id: user._id,
        }, {
          permissions: confPerms,
        }).exec());
      }
    });

    await Promise.all(promises);

    console.log(`Fixed ${promises.length} permissions.`);

    await mongoose.disconnect();
    process.exit();
  } catch (e) {
    process.exit(1);
  }
})();
