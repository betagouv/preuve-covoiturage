import { anyTest, TestFn, Context } from '@/dev_deps.ts';
import { FlattenTripInterface } from '../actions/BuildExportAction.ts';
import { ExportTripInterface } from '../interfaces/index.ts';
import { normalizeExport, normalizeOpendata } from './normalizeExportDataHelper.ts';

const test = anyTest as TestFn<Context>;

test.before((t) => {
  const tripWithoutIncentive: ExportTripInterface = {
    journey_id: '',
    trip_id: '',
    journey_start_datetime: new Date('2021-09-26 12:00:00+00'),
    journey_start_lon: '',
    journey_start_lat: '',
    journey_start_insee: '',
    journey_start_department: '',
    journey_start_town: '',
    journey_start_towngroup: '',
    journey_start_country: '',
    journey_end_datetime: new Date('2021-09-26 12:20:00+00'),
    journey_end_lon: '',
    journey_end_lat: '',
    journey_end_insee: '',
    journey_end_department: '',
    journey_end_town: '',
    journey_end_towngroup: '',
    journey_end_country: '',
    driver_card: false,
    driver_revenue: 500,
    passenger_card: false,
    passenger_over_18: false,
    passenger_seats: 1,
    operator_class: 'C',
    operator_journey_id: '',
    operator_passenger_id: '',
    operator_driver_id: '',
    journey_distance: 0,
    journey_duration: 0,
    journey_distance_anounced: 0,
    journey_distance_calculated: 0,
    journey_duration_anounced: 0,
    journey_duration_calculated: 0,
  };
  t.context = {
    TRIP_WITHOUT_INCENTIVE: tripWithoutIncentive,
    TRIP_WITH_DRIVER_INCENTIVE: {
      ...tripWithoutIncentive,
      driver_incentive_raw: [
        {
          siret: '89015202800019',
          amount: 200,
          type: 'incentive',
        },
      ],
      driver_incentive_rpc_raw: [
        {
          siret: '89015202800019',
          amount: 200,
          type: 'incentive',
        },
      ],
    },
    TRIP_WITH_PASSENGER_INCENTIVE: {
      ...tripWithoutIncentive,
      passenger_incentive_raw: [
        {
          siret: '89015202800019',
          amount: 200,
          type: 'incentive',
        },
      ],
      passenger_incentive_rpc_raw: [
        {
          siret: '89015202800019',
          amount: 200,
          type: 'incentive',
        },
      ],
    },
  };
});

test('normalizeExportHelper: should flattern trip with driver_incentive for export', (t) => {
  // Act
  const result: FlattenTripInterface = normalizeExport(t.context.TRIP_WITH_DRIVER_INCENTIVE, 'Europe/Paris');

  // Assert
  t.is(result.driver_incentive_1_amount, 2);
  t.is(result.driver_incentive_1_siret, '89015202800019');

  t.is(result.passenger_incentive_1_amount, 0);
  t.is(result.passenger_incentive_1_siret, undefined);

  t.is(result.journey_start_datetime, '2021-09-26T14:00:00+02:00');
  t.is(result.driver_revenue, 5);
  t.is(result.has_incentive, undefined);
});

test('normalizeExportHelper: should flattern trip with passenger incentive for export', (t) => {
  // Act
  const result: FlattenTripInterface = normalizeExport(t.context.TRIP_WITH_PASSENGER_INCENTIVE, 'Europe/Paris');

  // Assert
  t.is(result.passenger_incentive_1_amount, 2);
  t.is(result.passenger_incentive_1_siret, '89015202800019');

  t.is(result.driver_incentive_1_amount, 0);
  t.is(result.driver_incentive_1_siret, undefined);

  t.is(result.journey_start_datetime, '2021-09-26T14:00:00+02:00');
  t.is(result.driver_revenue, 5);
  t.is(result.has_incentive, undefined);
});

test('normalizeExportHelper: should flattern trip without driver_incentive for opendata export', (t) => {
  // Act
  const result: FlattenTripInterface = normalizeOpendata(t.context.TRIP_WITH_DRIVER_INCENTIVE, 'Europe/Paris');

  // Assert
  t.is(result.driver_incentive_1_amount, undefined);
  t.is(result.driver_incentive_1_siret, undefined);

  t.is(result.passenger_incentive_1_amount, undefined);
  t.is(result.passenger_incentive_1_siret, undefined);

  t.is(result.journey_start_datetime, '2021-09-26T14:00:00+02:00');
  t.is(result.driver_revenue, 500);
  t.is(result.has_incentive, true);
});

test('normalizeExportHelper: should flattern trip with incentive false for opendata export', (t) => {
  // Act
  const result: FlattenTripInterface = normalizeOpendata(t.context.TRIP_WITHOUT_INCENTIVE, 'Europe/Paris');

  // Assert
  t.is(result.driver_incentive_1_amount, undefined);
  t.is(result.driver_incentive_1_siret, undefined);

  t.is(result.passenger_incentive_1_amount, undefined);
  t.is(result.passenger_incentive_1_siret, undefined);

  t.is(result.journey_start_datetime, '2021-09-26T14:00:00+02:00');
  t.is(result.driver_revenue, 500);
  t.is(result.has_incentive, false);
});

// eslint-disable-next-line max-len
test('normalizeExportHelper: should flattern trip with incentive true for passenger incentives for opendata export', (t) => {
  // Act
  const result: FlattenTripInterface = normalizeOpendata(t.context.TRIP_WITH_PASSENGER_INCENTIVE, 'Europe/Paris');

  // Assert
  t.is(result.driver_incentive_1_amount, undefined);
  t.is(result.driver_incentive_1_siret, undefined);

  t.is(result.passenger_incentive_1_amount, undefined);
  t.is(result.passenger_incentive_1_siret, undefined);

  t.is(result.journey_start_datetime, '2021-09-26T14:00:00+02:00');
  t.is(result.driver_revenue, 500);
  t.is(result.has_incentive, true);
});
