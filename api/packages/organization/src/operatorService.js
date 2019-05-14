const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;
const { serviceFactory } = require('@pdc/shared-providers').mongo;
const { User } = require("@pdc/service-user").user.entities.models;
const Operator = require('./entities/models/Operator');

export const operatorService = serviceFactory(Operator, {
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


/**
 * Extend Operator.find to add contact details
 */
const baseFind = operatorService.find;
operatorService.find = async (query) => {
  const { meta, data } = await baseFind(query);
  const promises = data.map(async (itemDoc) => {
    const item = itemDoc.toObject();
    if (!item.contacts) return item;
    const contacts = Object.values(item.contacts).filter(String) || [];
    (await User.find({ _id: { $in: contacts } }).exec())
      .forEach((userDoc) => {
        const user = userDoc.toObject();
        Object.keys(item.contacts).forEach((key) => {
          const val = item.contacts[key];
          if (val && user._id.toString() === val.toString()) {
            item.contacts[key] = _.pick(user, [
              '_id',
              'firstname',
              'lastname',
              'email',
              'phone',
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
