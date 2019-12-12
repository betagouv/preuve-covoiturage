export const test15ContributionTooLow = {
  journey_id: 'test15ContributionTooLow',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: -1000,
    incentives: [],
  },
};
