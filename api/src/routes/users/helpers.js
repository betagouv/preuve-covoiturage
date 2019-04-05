const _ = require('lodash');

const userHelpers = {
  /**
   * Super admin users must be in the 'registry' group
   * and have an 'admin' role
   *
   * @param user
   * @returns {*}
   */
  isSuperAdmin(user) {
    return userHelpers.isRegistry(user) && userHelpers.isAdmin(user);
  },

  /**
   * User is an admin
   *
   * @param user
   * @returns {boolean}
   */
  isAdmin(user) {
    return _.get(user, 'role') === 'admin';
  },

  /**
   * User has a role of 'user'
   *
   * @param user
   * @returns {boolean}
   */
  isUser(user) {
    return _.get(user, 'role') === 'user';
  },

  /**
   * User belongs to an AOM
   *
   * @param user
   * @returns {boolean}
   */
  isAom(user) {
    return _.get(user, 'group') === 'aom';
  },

  /**
   * User belongs to an Operator
   *
   * @param user
   * @returns {boolean}
   */
  isOperator(user) {
    return _.get(user, 'group') === 'operators';
  },

  /**
   * User belongs to an Registry
   *
   * @param user
   * @returns {boolean}
   */
  isRegistry(user) {
    return _.get(user, 'group') === 'registry';
  },
};

module.exports = userHelpers;
