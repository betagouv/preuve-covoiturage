/* eslint-disable no-console */
const _ = require('lodash');

const data = {
  paris: {
    name: 'ILE-DE-FRANCE',
    codes: [
      '75101',
      '75102',
      '75103',
      '75104',
      '75105',
      '75106',
      '75107',
      '75108',
      '75109',
      '75110',
      '75111',
      '75112',
      '75113',
      '75114',
      '75115',
      '75116',
      '75117',
      '75118',
      '75119',
      '75120',
    ],
  },
  lyon: {
    name: '(LYON)',
    codes: [
      '69381',
      '69382',
      '69383',
      '69384',
      '69385',
      '69386',
      '69387',
      '69388',
      '69389',
      '69901',
    ],
  },
  marseille: {
    name: 'MARSEILLE',
    codes: [
      '13201',
      '13202',
      '13203',
      '13204',
      '13205',
      '13206',
      '13207',
      '13208',
      '13209',
      '13210',
      '13211',
      '13212',
      '13213',
      '13214',
      '13215',
      '13216',
    ],
  },
};

const findAoms = (db, list) => Object.keys(list).map(async (key) => {
  const { name, codes } = list[key];

  return {
    aom: await db.collection('aoms').findOne({ name: new RegExp(name) }, { name: 1, insee: 1 }),
    name,
    codes,
  };
});

const pushCodes = db => results => results.map((res) => {
  const diff = _.difference(res.codes, res.aom.insee);
  if (diff.length) {
    return db
      .collection('aoms')
      .findOneAndUpdate({ _id: res.aom._id }, { $push: { insee: { $each: diff } } });
  }

  return res;
});

const pullCodes = db => results => results.map(res => db
  .collection('aoms')
  .findOneAndUpdate({ _id: res.aom._id }, { $pull: { insee: { $in: res.codes } } }));

module.exports = {
  up(db) {
    const promises = [];

    // find AOMs
    promises.push(findAoms(db, data));

    // find the missing codes
    return Promise.all(...promises)
      .then(pushCodes(db))
      .then(arr => Promise.all(arr))
      .catch(console.log);
  },

  down(db) {
    const promises = [];

    // find AOMs
    promises.push(findAoms(db, data));

    // remove listed codes
    return Promise.all(...promises)
      .then(pullCodes(db))
      .then(arr => Promise.all(arr))
      .catch(console.log);
  },
};
