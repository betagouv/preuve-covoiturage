export const test18WrongOperatorClass = {
  journey_id: '1234',
  operator_class: 'D',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    contribution: 300,
    incentives: [],
  },
};
