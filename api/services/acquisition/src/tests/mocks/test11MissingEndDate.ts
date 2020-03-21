export const test11MissingEndDate = {
  journey_id: 'test11MissingEndDate',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(), literal: 'Paris', country: 'France' },
    end: { literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};
