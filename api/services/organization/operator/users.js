const { ObjectId } = require('mongoose').Types;
const Operator = require('../entities/models/operator');
const User = require('../../user/entities/models/user');

module.exports = {
  async addUser(id, userId) {
    const operator = await Operator.findById(id);
    const user = await User.findOne({ _id: userId });
    await user.setOperator(operator);

    return user.save();
  },

  async removeUser(id, userId) {
    const user = await User.findOne({ _id: userId });
    await user.unsetOperator();

    return user.save();
  },

  async users(id) {
    return User.find({ operator: ObjectId(id) });
  },
};
