/* eslint-disable no-param-reassign */
const { ObjectId } = require('mongoose').Types;
const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const User = require('@pdc/service-user/entities/models/user');
const Aom = require('./entities/models/aom');

module.exports = serviceFactory(Aom, {
  async addUser(id, userId) {
    const aom = await Aom.findOne({ _id: id });
    const user = await User.findOne({ _id: userId });
    await user.setAom(aom);

    return user.save();
  },

  async removeUser(id, userId) {
    const user = await User.findOne({ _id: userId });
    await user.unsetAom();

    return user.save();
  },

  async users(id) {
    return User.find({ aom: ObjectId(id) });
  },
});
