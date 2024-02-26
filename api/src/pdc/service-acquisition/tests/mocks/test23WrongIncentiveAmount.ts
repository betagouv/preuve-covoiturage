export const test23WrongIncentiveAmount = {
  journey_id: 'test23WrongIncentiveAmount',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 300,
    incentives: [
      {
        amount: -100,
        siret: '12345678901234',
        index: 0,
      },
    ],
  },
};
