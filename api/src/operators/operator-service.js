const Operator = require("./operator-model");

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
  }
};

module.exports = operatorService;
