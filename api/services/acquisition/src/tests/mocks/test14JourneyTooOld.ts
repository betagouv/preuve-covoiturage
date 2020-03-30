// 1 hour trip 8 days ago
const start = new Date().getTime() - 8 * 86400 * 1000;
const end = start + 3600 * 1000;

export const test14JourneyTooOld = {
  journey_id: 'test14JourneyTooOld',
  operator_class: 'A',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date(start), literal: 'Paris', country: 'France' },
    end: { datetime: new Date(end), literal: 'Evry', country: 'France' },
    contribution: 0,
    incentives: [],
  },
};
