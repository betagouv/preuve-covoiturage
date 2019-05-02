/* eslint-disable no-console */
const User = require('../models/user');
const userService = require('../../service');

/**
 * Get email or password from process.env variables
 * or fallback to default value
 *
 * @param envName
 * @param def
 * @returns {*}
 */
const getCredentials = (envName, def = false) => {
  if (process.env[envName] && process.env[envName] !== '') {
    return process.env[envName];
  }

  if (process.env.NODE_ENV === 'test' && def !== '') {
    return def;
  }

  return false;
};

module.exports = async () => {
  const user = await User.findOne({
    group: 'registry',
    role: 'admin',
  }).exec();

  if (user) {
    return true;
  }

  const email = getCredentials('APP_SUPERUSER_EMAIL', 'admin@example.com');
  const password = getCredentials('APP_SUPERUSER_PASSWORD', 'admin1234');
  if (!email || !password) return false;

  await userService.create(
    {
      phone: '+33123456789',
      firstname: 'Super',
      lastname: 'Admin',
      email,
      password,
      group: 'registry',
      role: 'admin',
    },
    {},
    false,
  );

  if (process.env.NODE_ENV !== 'test') {
    console.log('- 💾 Created a super admin user');
  }

  return true;
};
