/* eslint-disable no-param-reassign */
const _ = require("lodash");
const { ObjectId } = require("mongoose").Types;
const { serviceFactory } = require("@pdc/shared-providers").mongo;
const { User } = require("@pdc/service-user").user.entities.models;
const Aom = require("./entities/models/Aom");

export const aomService = serviceFactory(Aom, {
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

/**
 * Extend Aom.find to add contact details
 */
const baseFind = aomService.find;
aomService.find = async (query) => {
  const { meta, data } = await baseFind(query);
  const promises = data.map(async (itemDoc) => {
    const item = itemDoc.toObject();
    if (!item.contacts) return item;
    const contacts = Object.values(item.contacts).filter(String) || [];
    (await User.find({ _id: { $in: contacts } }).exec()).forEach((userDoc) => {
      const user = userDoc.toObject();
      Object.keys(item.contacts).forEach((key) => {
        const val = item.contacts[key];
        if (val && user._id.toString() === val.toString()) {
          item.contacts[key] = _.pick(user, [
            "_id",
            "firstname",
            "lastname",
            "email",
            "phone",
          ]);
        }
      });
    });

    return item;
  });

  return {
    meta,
    data: await Promise.all(promises),
  };
};
