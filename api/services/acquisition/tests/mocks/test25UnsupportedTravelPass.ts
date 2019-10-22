export const test25UnsupportedTravelPass = {
  journey_id: '1234',
  operator_class: 'A',
  passenger: {
    identity: {
      phone: '+33612345678',
      travel_pass: {
        name: 'unsupported',
        user_id: '1234',
      },
    },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    contribution: 300,
    incentives: [],
  },
};
