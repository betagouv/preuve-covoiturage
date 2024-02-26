export const test24WrongPaymentAmount = {
  journey_id: 'test24WrongPaymentAmount',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 300,
    incentives: [],
    payments: [
      {
        pass_type: 'cb',
        amount: -1,
      },
    ],
  },
};
