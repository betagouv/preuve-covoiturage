/* eslint-disable no-console */
const _ = require('lodash');
const mongoose = require('mongoose');
const { mongoUrl } = require('@pdc/shared/config');
const Permissions = require('@pdc/shared/helpers/permissions/permissions');
const { User } = require("@pdc/service-user").user.entities.models;

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
      const { _id, email, role, group, permissions } = user.toObject();
      const confPerms = Permissions.getFromRole(group, role);
      const perms = Object.values(permissions);
      if (_.difference(confPerms, perms).length !== 0
        || confPerms.length !== perms.length) {
        console.log(_id.toString(), email, _.difference(confPerms, perms));

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
