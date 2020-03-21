export const test25UnsupportedTravelPass = {
  journey_id: 'test25UnsupportedTravelPass',
  operator_class: 'A',
  passenger: {
    identity: {
      phone: '+33612345678',
      travel_pass_name: 'unsupported',
      travel_pass_user_id: '1234',
    },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 300,
    incentives: [],
  },
};
