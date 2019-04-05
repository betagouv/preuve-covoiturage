/* eslint-disable no-console */
const Operator = require('../../routes/operators/model');
const operatorService = require('../../routes/operators/service');
const User = require('../../routes/users/model');
const userService = require('../../routes/users/service');

module.exports = async function dummyAom() {
  // search for dummy aom
  let operator = await Operator.findOne({ nom_commercial: 'Dummy Operator' }).exec();

  // create the AOM
  if (!operator) {
    operator = await operatorService.create({
      nom_commercial: 'Dummy Operator',
      raison_sociale: 'Dummy Operator',
      company: {
        siren: '123456789',
      },
    });
  }

  const user = await User.findOne({ email: 'operator@example.com' }).exec();

  // check if a user is attached to this AOM
  if (!user) {
    await userService.create({
      firstname: 'Dummy',
      lastname: 'Operator',
      email: 'operator@example.com',
      phone: '+33123456789',
      password: 'operator',
      group: 'operators',
      role: 'admin',
      operator: operator._id,
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log('- 💾 Create Dummy operator with user operator@example.com');
  }
};
