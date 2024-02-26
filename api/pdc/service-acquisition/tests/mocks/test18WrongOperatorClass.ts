export const test18WrongOperatorClass = {
  journey_id: 'test18WrongOperatorClass',
  operator_class: 'D',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 300,
    incentives: [],
  },
};
