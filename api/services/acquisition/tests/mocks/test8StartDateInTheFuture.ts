export const test8StartDateInTheFuture = {
  journey_id: '1234',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() + 10000), literal: 'Paris' },
    end: { datetime: new Date(new Date().getTime() + 20000), literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};
