const { assign } = require("lodash");
const Aom = require("./aomModel");

const aomService = {
  find(query = {}) {
    return Aom.find(query);
  },

  async update(id, data) {
    return await Aom.findOneAndUpdate({ _id: id }, data, { new: true });
  },

  async create(data) {
    const aom = new Aom(data);
    await aom.save();

    return aom;
  },

  async delete(id, force = false) {
    if (force) {
      return await Aom.findOneAndDelete({ _id: id });
    }

    return await Aom.findAndModify({ _id: id }, { deletedAt: Date.now() });
  }
};

module.exports = aomService;
