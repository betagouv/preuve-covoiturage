export const test5PassengerOnly = {
  journey_id: 'test5PassengerOnly',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 3600000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 0,
    incentives: [],
  },
};
