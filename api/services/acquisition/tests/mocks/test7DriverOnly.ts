export const test7DriverOnly = {
  journey_id: '1234',
  operator_class: 'A',
  driver: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(new Date().getTime() - 1000), literal: 'Paris' },
    end: { datetime: new Date(), literal: 'Evry' },
    revenue: 0,
    incentives: [],
  },
};
