import { AcquisitionInterface } from '../src/shared/acquisition/common/interfaces/AcquisitionInterface';
import { JourneyInterface } from '../src/shared/common/interfaces/JourneyInterface';

export function mockJourneyToAcquisition(journey: JourneyInterface, acquisition: any = null): AcquisitionInterface {
  return {
    _id: 1,
    journey_id: journey.journey_id,
    operator_id: journey.operator_id,
    application_id: 'test-app',
    payload: journey,
    created_at: new Date(),
    ...acquisition,
  };
}

export const irtSystemXTestPassenger: AcquisitionInterface = mockJourneyToAcquisition({
  journey_id: '8ce35944-a822-4e78-ab24-2ff30eee436a',
  operator_journey_id: 'expe-covoit-7476524f-6faa-4231-87b3-4c7c85051aed',
  operator_class: 'A',
  operator_id: 1,

  passenger: {
    expense: 0,
    identity: {
      firstname: 'Damien',
      phone: '0685621658',
    },
    start: {
      datetime: new Date('2020-01-08T09:00:00Z'),
      lat: 45.73634,
      lon: 4.82616,
    },
    end: {
      datetime: new Date('2020-01-08T09:30:00Z'),
      lat: 45.77808,
      lon: 4.87453,
    },
    contribution: 0,
    seats: 1,
    incentives: [],
  },
});

export const irtSystemXTestDriver = mockJourneyToAcquisition({
  journey_id: '8ce35944-a822-4e78-ab24-2ff30eee436a',
  operator_journey_id: 'expe-covoit-7476524f-6faa-4231-87b3-4c7c85051aed',
  operator_class: 'B',
  operator_id: 2,

  driver: {
    expense: 0,
    identity: {
      firstname: 'Maroua',
      phone: '0685621659',
    },
    start: {
      datetime: new Date('2020-01-08T09:00:00Z'),
      lat: 45.73634,
      lon: 4.82616,
    },
    end: {
      datetime: new Date('2020-01-08T09:30:00Z'),
      lat: 45.77808,
      lon: 4.87453,
    },
    revenue: 0,
    incentives: [],
  },
});

export const irtSystemXTestDifferentDriver = mockJourneyToAcquisition({
  journey_id: '8ce35944-a822-4e78-ab24-2ff30eee436b',
  operator_journey_id: 'expe-covoit-7476524f-6faa-4231-87b3-4c7c85051aed',
  operator_class: 'B',
  operator_id: 2,

  driver: {
    expense: 0,
    identity: {
      firstname: 'Maroua',
      phone: '0685621659',
    },
    start: {
      datetime: new Date('2020-01-08T09:00:00Z'),
      lat: 45.73634,
      lon: 4.82616,
    },
    end: {
      datetime: new Date('2020-01-08T09:30:00Z'),
      lat: 45.77808,
      lon: 4.87453,
    },
    revenue: 0,
    incentives: [],
  },
});

export const irtSystemXTestCoupleMatching = {
  ...irtSystemXTestDriver,
  ...irtSystemXTestPassenger,
};
