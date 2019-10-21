export const test20WrongIncentiveSiret = {
  journey_id: '1234',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    contribution: 300,
    incentives: [
      {
        amount: 100,
        siret: '1234567890111111111111111111',
        index: 1,
      },
    ],
  },
};
