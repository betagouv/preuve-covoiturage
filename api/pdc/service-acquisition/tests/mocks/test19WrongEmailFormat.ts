export const test19WrongEmailFormat = {
  journey_id: 'test19WrongEmailFormat',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678', email: 'IamFake!!!' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 300,
    incentives: [],
  },
};
