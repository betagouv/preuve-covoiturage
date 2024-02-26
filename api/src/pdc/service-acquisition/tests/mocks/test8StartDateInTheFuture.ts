export const test8StartDateInTheFuture = {
  journey_id: 'test8StartDateInTheFuture',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() + 10000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(new Date().getTime() + 20000), literal: 'Evry', country: 'France' },
    contribution: 0,
    incentives: [],
  },
};
