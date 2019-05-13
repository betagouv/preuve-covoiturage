const _ = require('lodash');
const serviceFactory = require('@pdc/shared/providers/mongo/service-factory');
const User = require('@pdc/service-user/entities/models/user');
const Operator = require('./entities/models/operator');
const users = require('./operator/users');
const authorisations = require('./operator/authorisations');

const service = serviceFactory(Operator, {
  ...users,
  ...authorisations,
});

/**
 * Extend Operator.find to add contact details
 */
const baseFind = service.find;
service.find = async (query) => {
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
          item.contacts[key] = _.pick(user, ['_id', 'firstname', 'lastname', 'email', 'phone']);
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

module.exports = service;
