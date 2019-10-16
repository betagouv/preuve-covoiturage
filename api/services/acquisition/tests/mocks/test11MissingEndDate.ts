export const test11MissingEndDate = {
  journey_id: '1234',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(), literal: 'Paris' },
    end: { literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};
