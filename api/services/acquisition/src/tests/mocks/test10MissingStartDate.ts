export const test10MissingStartDate = {
  journey_id: 'test10MissingStartDate',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { literal: 'Paris' },
    end: { datetime: new Date(new Date().getTime() - 1000), literal: 'Evry', country: 'France' },
    contribution: 0,
    incentives: [],
  },
};
