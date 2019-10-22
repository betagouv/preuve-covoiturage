export const test9StartAfterEnd = {
  journey_id: '1234',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(), literal: 'Paris' },
    end: { datetime: new Date(new Date().getTime() - 1000), literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};
