import { ResultInterface as Campaign } from '../../../shared/policy/find.contract';
import test from 'ava';
import { Workbook, Worksheet } from 'exceljs';
import faker from '@faker-js/faker';
import { ExportTripInterface } from '../../../interfaces';
import { BuildExportAction } from '../../BuildExportAction';
import { StreamDataToWorkBook } from './StreamDataToWorkbook';

let streamDataToWorkBook: StreamDataToWorkBook;

const exportTripInterface: ExportTripInterface<Date> & { operator: string } = {
  journey_id: faker.random.uuid(),
  trip_id: faker.random.uuid(),

  journey_start_datetime: faker.date.past(2),
  journey_start_lon: faker.address.longitude(),
  journey_start_lat: faker.address.longitude(),
  journey_start_insee: '',
  journey_start_department: faker.address.countryCode(),
  journey_start_town: faker.address.city(),
  journey_start_towngroup: '',
  journey_start_country: faker.address.country(),

  journey_end_datetime: faker.date.future(2),
  journey_end_lon: faker.address.longitude(),
  journey_end_lat: faker.address.latitude(),
  journey_end_insee: '',
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
  operator: faker.random.alphaNumeric(),

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

const campaign: Campaign = {
  state: {
    amount: 0,
    trip_subsidized: 0,
    trip_excluded: 0,
  },
  territory_id: 0,
  name: '',
  description: '',
  start_date: new Date(),
  end_date: new Date(),
  unit: '',
  status: '',
  global_rules: [],
  rules: [],
};

test.before((t) => {
  streamDataToWorkBook = new StreamDataToWorkBook();
});

test('StreamDataToWorkBook: should stream data to a workbook file', async (t) => {
  // Arrange
  const tripCursor = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
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
  const cursorCallback = (count: number): Promise<ExportTripInterface<Date>[]> => {
    if (counter <= 0) {
      return cursorEndingResult;
    }
    counter = counter - 10;
    return tripCursor;
  };

  const filename = '/tmp/stream-data-test.xlsx';

  // Act
  await streamDataToWorkBook.call({ read: cursorCallback, release: () => {} }, filename, campaign);

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(filename);
  const worksheet: Worksheet = workbook.getWorksheet(streamDataToWorkBook.WORKSHEET_NAME);
  t.is(worksheet.actualRowCount, 21);
  t.deepEqual(workbook.getWorksheet(streamDataToWorkBook.WORKSHEET_NAME).getRow(1).values, [
    undefined,
    ...BuildExportAction.getColumns('territory'),
  ]);
  t.is(
    workbook.getWorksheet(streamDataToWorkBook.WORKSHEET_NAME).getRow(2).values.length,
    BuildExportAction.getColumns('territory').length + 1,
  );
  t.is(
    workbook.getWorksheet(streamDataToWorkBook.WORKSHEET_NAME).getRow(2).getCell(2).value,
    exportTripInterface.trip_id,
  );
  t.deepEqual(
    workbook.getWorksheet(streamDataToWorkBook.WORKSHEET_NAME).getRow(2).getCell('AD').value,
    exportTripInterface.operator,
  );
});
