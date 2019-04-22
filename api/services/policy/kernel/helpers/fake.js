const moment = require('moment');

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
        insee: 69001,
      },
      end: {
        datetime: moment({ year: 2018, month: 1, day: 10, hour: 10, minute: 0 }).toDate(),
        aom: {
          _id: 'aom',
        },
        insee: 69028,
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
  ],
};

const basePolicy = {
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
  //   minRank: Number,
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

const complexPolicy = {
  _id: 'complex',
  aom: 'aom',
  name: 'My complex policy',
  // rules: {
  //   weekday: [{
  //     type: Number,
  //   }],
  //   time: [IncentiveTimeFilterSchema],
  //   range: {
  //     min: Number,
  //     max: Number,
  //   },
  //   minRank: Number,
  // },
  parameters: [
    {
      varname: 'prixAuKm',
      internal: false,
    },
    {
      varname: 'tauxConducteur',
      internal: false,
      formula: 'conducteur*0.5',
    },
  ],
  formula: 'tauxConducteur*distance*prixAuKm',
  unit: {
    name: 'Incitation financière en euros',
    short_name: 'EUR',
    financial: true,
    precision: 2,
  },
};

const fakeCampaign = {
  _id: 'mycampaign',
  aom: 'aom',
  start: new Date(Date.UTC(2018, 1, 1, 0, 0, 0)),
  end: new Date(Date.UTC(2018, 1, 28, 0, 0, 0)),
  status: 'validated',
  policies: [
    {
      policy: basePolicy,
      parameters: [
        {
          key: 'prixAuKm',
          value: 0.10,
        },
      ],
    },
    {
      policy: complexPolicy,
      parameters: [
        {
          key: 'prixAuKm',
          value: 0.10,
        },
      ],
    },
  ],
  trips: [],
};

module.exports = {
  fakeTrip,
  fakePolicy: basePolicy,
  fakeCampaign,
};
