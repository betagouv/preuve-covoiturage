const Permissions = require('@pdc/permissions');
const User = require('./user-model');

const userService = {
  find(query = {}) {
    return User.find(query);
  },

  async update(id, data) {
    const user = await User.findOneAndUpdate({ _id: id }, data, { new: true });

    // set the permissions here as the findOneAndUpdate Mongoose middleware
    // cannot access the original document
    user.permissions = Permissions.getFromRole(user.group, user.role);

    return user.save();
  },

  async create(data) {
    const user = new User(data);
    user.permissions = Permissions.getFromRole(user.group, user.role);

    return user.save();
  },

  async delete(id, force = false) {
    if (force) {
      return User.findOneAndDelete({ _id: id });
    }

    return User.findOneAndUpdate({ _id: id }, { deletedAt: Date.now() });
  },
};

module.exports = userService;
