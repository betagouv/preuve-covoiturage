const { ObjectId } = require('mongoose').Types;
const Aom = require('../entities/models/aom');
const User = require('../../user/entities/models/user');

module.exports = {
  async addUser(id, userId) {
    const aom = await Aom.findById(id);
    const user = await User.findById(userId);
    await user.setAom(aom);

    return user.save();
  },

  async removeUser(id, userId) {
    const user = await User.findById(userId);
    await user.unsetAom();

    return user.save();
  },

  async users(id) {
    return User.find({ aom: ObjectId(id) });
  },
};
