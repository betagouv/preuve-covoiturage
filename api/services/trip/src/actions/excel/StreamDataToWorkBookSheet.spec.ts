import anyTest, { TestInterface } from 'ava';
import { Workbook } from 'exceljs';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { ExportTripInterface } from '../../interfaces';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { BuildExportAction } from '../BuildExportAction';
import { StreamDataToWorkBookSheet } from './StreamDataToWorkBookSheet';

export const exportTripInterface: ExportTripInterface<Date> = {
  journey_id: faker.random.uuid(),
  trip_id: faker.random.uuid(),

  journey_start_datetime: faker.date.past(2),
  journey_start_lon: faker.address.longitude(),
  journey_start_lat: faker.address.longitude(),
  journey_start_insee: '',
  journey_start_postalcode: faker.address.zipCode(),
  journey_start_department: faker.address.countryCode(),
  journey_start_town: faker.address.city(),
  journey_start_towngroup: '',
  journey_start_country: faker.address.country(),

  journey_end_datetime: faker.date.future(2),
  journey_end_lon: faker.address.longitude(),
  journey_end_lat: faker.address.latitude(),
  journey_end_insee: '',
  journey_end_postalcode: faker.address.zipCode(),
  journey_end_department: faker.address.countryCode(),
  journey_end_town: faker.address.city(),
  journey_end_towngroup: '',
  journey_end_country: faker.address.country(),

  driver_card: false,
  passenger_card: false,
  passenger_over_18: true,
  passenger_seats: 1,
  operator_class: 'C',
  operator_journey_id: faker.random.uuid(),
  operator_passenger_id: faker.random.uuid(),
  operator_driver_id: faker.random.uuid(),

  journey_distance: 865,
  journey_duration: 78,
  journey_distance_anounced: 800,
  journey_distance_calculated: 800,
  journey_duration_anounced: 800,
  journey_duration_calculated: 800,

  passenger_id: faker.random.uuid(),
  passenger_contribution: 8,
  passenger_incentive_raw: null,
  passenger_incentive_rpc_raw: null,

  driver_id: faker.random.uuid(),
  driver_revenue: 75,
  driver_incentive_raw: null,
  driver_incentive_rpc_raw: null,
};

interface Context {
  // Injected tokens
  streamTripsForCampaginComponent: StreamDataToWorkBookSheet;
  tripRepositoryProvider: TripRepositoryProvider;

  // Injected tokens method's stubs
  tripRepositoryProviderStub: SinonStub;

  // Tested token
  streamDataToWorkBookSheet: StreamDataToWorkBookSheet;

  // Constants
  date: Date;
  campaign_id: number;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null);
  t.context.streamTripsForCampaginComponent = new StreamDataToWorkBookSheet(t.context.tripRepositoryProvider);
  t.context.date = faker.date.past();
  t.context.campaign_id = faker.random.number();
});

test.afterEach((t) => {
  t.context.tripRepositoryProviderStub.restore();
});

test('StreamDataToWorkBookSheet: should stream 20 rows to workbook', async (t) => {
  // Arrange
  const workbook: Workbook = successArrangeStubs(t);

  // Act
  const generatedWorkbook: Workbook = await t.context.streamTripsForCampaginComponent.call(
    t.context.campaign_id,
    workbook,
    t.context.date,
    t.context.date,
    5,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.tripRepositoryProviderStub,
    { date: { start: t.context.date, end: t.context.date }, campaign_id: [t.context.campaign_id], operator_id: [5] },
    'territory',
  );
  t.deepEqual(generatedWorkbook.getWorksheet('data').getRow(1).values, [
    undefined,
    ...BuildExportAction.getColumns('territory'),
  ]);
  t.is(
    generatedWorkbook.getWorksheet('data').getRow(2).values.length,
    BuildExportAction.getColumns('territory').length + 1,
  );
  t.is(generatedWorkbook.getWorksheet('data').getRow(2).getCell(2).value, exportTripInterface.trip_id);
  t.true(generatedWorkbook.getWorksheet('data').getRow(2).getCell('operator').value !== undefined);
  t.is(generatedWorkbook.getWorksheet('data').rowCount, 22);
});

// eslint-disable-next-line max-len
test.skip('StreamDataToWorkBookSheet: should stream 20 rows to workbook and call without operator if not provided', async (t) => {
  // Arrange
  const workbook: Workbook = successArrangeStubs(t);

  // Act
  const generatedWorkbook: Workbook = await t.context.streamTripsForCampaginComponent.call(
    t.context.campaign_id,
    workbook,
    t.context.date,
    t.context.date,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.tripRepositoryProviderStub,
    { date: { start: t.context.date, end: t.context.date }, campaign_id: [t.context.campaign_id], operator_id: null },
    'territory',
  );
  t.deepEqual(generatedWorkbook.getWorksheet('data').getRow(1).values, [
    undefined,
    ...BuildExportAction.getColumns('territory'),
  ]);
  t.is(
    generatedWorkbook.getWorksheet('data').getRow(2).values.length,
    BuildExportAction.getColumns('territory').length + 1,
  );
  t.is(generatedWorkbook.getWorksheet('data').getRow(2).getCell(2).value, exportTripInterface.trip_id);
  t.true(generatedWorkbook.getWorksheet('data').getRow(2).getCell('operator').value !== undefined);
  t.is(generatedWorkbook.getWorksheet('data').rowCount, 22);
});

function successArrangeStubs(t) {
  const cursorResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
    ]);
  });

  const cursorEndingResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([]);
  });
  let counter = 20;
  const returnedFunction = (count: number): Promise<ExportTripInterface[]> => {
    if (counter <= 0) {
      return cursorEndingResult;
    }
    counter = counter - 10;
    return cursorResult;
  };

  t.context.tripRepositoryProviderStub = sinon.stub(t.context.tripRepositoryProvider, 'searchWithCursor');
  t.context.tripRepositoryProviderStub.resolves(returnedFunction);

  const wb: Workbook = new Workbook();
  wb.addWorksheet('data');
  return wb;
}
