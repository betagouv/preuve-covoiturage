const _ = require('lodash');
const config = require('../../packages/config');

const Permissions = {
  types: ['aom', 'operators', 'registry'],

  getFromRole(type, role) {
    let roles = [];
    _.get(config, `${this.getType(type)}.roles`, []).forEach((r) => {
      if (r.slug !== role) return;
      roles = roles.concat(r.permissions);
    });

    if (!roles) {
      throw new Error('Unsupported roles for this type');
    }

    return _.uniq(roles);
  },

  getType(type = '') {
    // eslint-disable-next-line no-param-reassign
    type = type.toLowerCase().trim();
    if (this.types.indexOf(type) === -1) {
      throw new Error('Unsupported permission type');
    }

    return type;
  },
};

module.exports = Permissions;
