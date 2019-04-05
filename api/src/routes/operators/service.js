// const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;
const serviceFactory = require('../../packages/mongo/service-factory');
const Operator = require('./model');
const User = require('../users/model');

module.exports = serviceFactory(Operator, {
  async addUser(id, userId) {
    const operator = await Operator.findOne({ _id: id });
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
});
