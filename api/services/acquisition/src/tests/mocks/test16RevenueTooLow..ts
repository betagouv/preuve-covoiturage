export const test16RevenueTooLow = {
  journey_id: 'test16RevenueTooLow',
  operator_class: 'A',
  driver: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    revenue: -1000,
    incentives: [],
  },
};
