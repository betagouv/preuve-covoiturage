const { ObjectId } = require('mongoose').Types;
const Aom = require('./aom-model');
const User = require('../users/user-model');

const aomService = {
  find(query = {}) {
    return Aom.find(query);
  },

  async update(id, data) {
    return Aom.findOneAndUpdate({ _id: id }, data, { new: true });
  },

  async create(data) {
    const aom = new Aom(data);
    await aom.save();

    return aom;
  },

  async delete(id, force = false) {
    if (force) {
      return Aom.findOneAndDelete({ _id: id });
    }

    return Aom.findOneAndUpdate({ _id: id }, { deletedAt: Date.now() });
  },

  async search({ lat, lng, insee }) {
    // TODO create a real searching algorithm

    return Aom.findOne({});
  },

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
};

module.exports = aomService;
