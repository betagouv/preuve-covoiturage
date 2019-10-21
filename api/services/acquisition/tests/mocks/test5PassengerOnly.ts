export const test5PassengerOnly = {
  journey_id: '1234',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 3600000), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    contribution: 0,
    incentives: [],
  },
};
