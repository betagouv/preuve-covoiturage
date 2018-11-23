const { ObjectId } = require("mongoose").Types;
const Operator = require("./operator-model");
const User = require("../users/user-model");

const operatorService = {
  find(query = {}) {
    return Operator.find(query);
  },

  async update(id, data) {
    return await Operator.findOneAndUpdate({ _id: id }, data, { new: true });
  },

  async create(data) {
    const operator = new Operator(data);
    await operator.save();

    return operator;
  },

  async delete(id, force = false) {
    if (force) {
      return await Operator.findOneAndDelete({ _id: id });
    }

    return await Operator.findOneAndUpdate({ _id: id }, { deletedAt: Date.now() });
  },

  async addUser(id, userId) {
    const operator = await Operator.findOne({ _id: id });
    const user = await User.findOne({ _id: userId });
    await user.setOperator(operator);

    return await user.save();
  },

  async removeUser(id, userId) {
    const user = await User.findOne({ _id: userId });
    await user.unsetOperator();

    return await user.save();
  },

  async users(id) {
    return await User.find({ "operator": ObjectId(id) });
  },
};

module.exports = operatorService;
