export const test7DriverOnly = {
  journey_id: 'test7DriverOnly',
  operator_class: 'A',
  driver: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(), literal: 'Evry', country: 'France' },
    revenue: 0,
    incentives: [],
  },
};
