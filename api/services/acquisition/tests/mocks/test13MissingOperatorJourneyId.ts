export const test13MissingOperatorJourneyId = {
  journey_id: 'test13MissingOperatorJourneyId',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    contribution: 0,
    incentives: [],
  },
};
