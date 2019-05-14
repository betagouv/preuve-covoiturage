const chai = require('chai');
const moment = require('moment');
const filter = require('./filter');

const { expect } = chai;

const fakeTrip = {
  _id: 'my_trip',
  operator_id: 'my_operator',
  people: [
    {
      _id: 'person',
      journey_id: 1,
      class: 'A',
      operator_class: 'A',
      operator: {
        _id: 1,
        nom_commercial: { type: String, alias: 'name' },
      },
      is_driver: true,
      identity: {
        over_18: true,
      },
      start: {
        datetime: moment({ year: 2018, month: 1, day: 10, hour: 8, minute: 0 }).toDate(),
        aom: {
          _id: 'aom',
        },
      },
      end: {
        datetime: moment({ year: 2018, month: 1, day: 10, hour: 10, minute: 0 }).toDate(),
        aom: {
          _id: 'aom',
        },
      },
      distance: 17.35,
      duration: 20,
      seats: 1,
      // cost: 0,
      // incentive: 0,
      // remaining_fee: 0,
      // contribution: 0,
      // revenue: 0,
      // expense: 0,
    },
    {
      _id: 'person2',
      journey_id: 1,
      class: 'B',
      operator_class: 'A',
      operator: {
        _id: 1,
        nom_commercial: { type: String, alias: 'name' },
      },
      is_driver: true,
      identity: {
        over_18: true,
      },
      start: {
        datetime: moment({ year: 2018, month: 1, day: 10, hour: 18, minute: 0 }).toDate(),
        aom: {
          _id: 'aom',
        },
      },
      end: {
        datetime: moment({ year: 2018, month: 1, day: 10, hour: 18, minute: 30 }).toDate(),
        aom: {
          _id: 'aom',
        },
      },
      distance: 5.35,
      duration: 20,
      seats: 1,
      // cost: 0,
      // incentive: 0,
      // remaining_fee: 0,
      // contribution: 0,
      // revenue: 0,
      // expense: 0,
    },
  ],
};

const fakePolicy = {
  _id: 'base',
  aom: 'aom',
  name: 'My basic policy',
  // rules: {
  //   weekday: [{
  //     type: Number,
  //   }],
  //   time: [IncentiveTimeFilterSchema],
  //   range: {
  //     min: Number,
  //     max: Number,
  //   },
  //   rank: Number,
  // },
  parameters: [{
    varname: 'prixAuKm',
    internal: false,
  }],
  formula: 'distance*prixAuKm',
  unit: {
    name: 'Incitation financière en euros',
    short_name: 'EUR',
    financial: true,
    precision: 2,
  },
};

describe('incentive: filter all', () => {
  it('works', async () => {
    const result = filter({
      trip: fakeTrip,
      policy: {
        ...fakePolicy,
        rules: {
          weekday: [2],
          time: [
            {
              start: '17:0',
              end: '19:0',
            },
          ],
        },
      },
    });
    expect(result.people.length).to.equal(1);
    expect(result.people[0]._id).to.equal(fakeTrip.people[1]._id);
  });

  it('works', async () => {
    const result = filter({
      trip: fakeTrip,
      policy: {
        ...fakePolicy,
        rules: {
          range: {
            min: 10,
          },
          rank: ['A', 'B'],
        },
      },
    });
    expect(result.people.length).to.equal(1);
    expect(result.people[0]._id).to.equal(fakeTrip.people[0]._id);
  });
});
