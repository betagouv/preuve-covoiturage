// const _ = require('lodash');
// const assert = require('assert');
// const mongoose = require('mongoose');
// const geo = require('../src/packages/geo');
// const { mongoUrl } = require('../src/config.js');
// const TestUser = require('../src/packages/mongo/user');

// it('db', async () => {
//   await mongoose.connect(mongoUrl, {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useCreateIndex: true,
//   });

// const tu = new TestUser();
// tu.firstname = 'Hello';
// tu.lastname = 'World';
// tu.password = 'Password!';
// tu.email = `helloworld-${Math.random() * 1000}@example.com`;
// tu.group = 'registry';
// tu.role = 'user';
// let cr = await tu.save();
//
// // cr.fullname = 'John Doe';
// cr.fullname = 'Jorge de la Casavetes';
// await cr.save();
//
// console.log('PW1:', await cr.comparePassword('Password!'));
//
// cr.password = 'Password1234';
// cr = await cr.save();

// const res = await TestUser.findOneAndUpdate(
//   { _id: '5c4b2224b4ee68232f35ac5b' },
//   { password: 'Password4321' },
//   { new: true },
// ).exec();
//
// console.log('last', await res.comparePassword('Password4321'));
// console.log((await TestUser.findOne({_id: '5c4b2224b4ee68232f35ac5b'}).exec()).toJSON());
// });
