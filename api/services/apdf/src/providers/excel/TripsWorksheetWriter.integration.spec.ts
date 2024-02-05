import faker from '@faker-js/faker';
import test from 'ava';
import { Row, stream, Workbook, Worksheet } from 'exceljs';
import { APDFTripInterface } from '../../interfaces/APDFTripInterface';
import { BuildExcel } from './BuildExcel';
import { TripsWorksheetWriter } from './TripsWorksheetWriter';

// tool to sort column names to be able to compare them
function sortRowValues(values: Row['values']): Row['values'] {
  if (Array.isArray(values)) return values.sort();
  if ('object' === typeof values) return Object.keys(values).sort();
  return values;
}

let dataWorkBookWriter: TripsWorksheetWriter;

const exportTripInterface: APDFTripInterface = {
  journey_id: faker.datatype.uuid(),
  trip_id: faker.datatype.uuid(),
  operator_trip_id: faker.datatype.uuid(),
  driver_uuid: faker.datatype.uuid(),
  operator_driver_id: faker.datatype.uuid(),
  rpc_incentive: faker.datatype.number(1000),
  passenger_uuid: faker.datatype.uuid(),
  operator_passenger_id: faker.datatype.uuid(),
  start_datetime: faker.date.past(2).toISOString(),
  end_datetime: faker.date.future(2).toISOString(),
  start_location: faker.address.cityName(),
  start_insee: faker.random.numeric(5, { allowLeadingZeros: true }),
  end_location: faker.address.cityName(),
  end_insee: faker.random.numeric(5, { allowLeadingZeros: true }),
  distance: faker.datatype.number({ min: 1_500, max: 150_000 }),
  duration: faker.datatype.number({ min: 300, max: 3600 }),
  operator: faker.company.companyName(),
  operator_class: 'C',
  incentive_type: faker.random.arrayElement(['normal', 'booster']),
  start_epci_name: faker.address.cityName(),
  start_epci: `${faker.random.alphaNumeric(5)}`,
  end_epci_name: faker.address.cityName(),
  end_epci: `${faker.random.alphaNumeric(5)}`,
};

test.before((t) => {
  dataWorkBookWriter = new TripsWorksheetWriter();
});

test('DataWorkBookWriter: should stream data to a workbook file', async (t) => {
  // Arrange
  const tripCursor = new Promise<APDFTripInterface[]>((resolve, reject) => {
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
  const cursorEndingResult = new Promise<APDFTripInterface[]>((resolve, reject) => {
    resolve([]);
  });
  let counter = 20;
  const cursorCallback = (count: number): Promise<APDFTripInterface[]> => {
    if (counter <= 0) {
      return cursorEndingResult;
    }
    counter = counter - 10;
    return tripCursor;
  };

  const filepath = '/tmp/stream-data-test.xlsx';

  // Act
  const booster_dates = new Set<string>();
  const workbookWriter: stream.xlsx.WorkbookWriter = BuildExcel.initWorkbookWriter(filepath);
  await dataWorkBookWriter.call({ read: cursorCallback, release: async () => {} }, booster_dates, workbookWriter);
  await workbookWriter.commit();

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(filepath);
  const worksheet: Worksheet = workbook.getWorksheet(dataWorkBookWriter.WORKSHEET_NAME);
  t.is(worksheet.actualRowCount, 21);
  t.deepEqual<Row['values'], Row['values']>(
    sortRowValues(workbook.getWorksheet(dataWorkBookWriter.WORKSHEET_NAME).getRow(1).values),
    [undefined, ...Object.keys(exportTripInterface)].sort(),
  );
  t.is(
    workbook.getWorksheet(dataWorkBookWriter.WORKSHEET_NAME).getRow(2).values.length,
    Object.keys(exportTripInterface).length + 1,
  );
  t.is(
    workbook.getWorksheet(dataWorkBookWriter.WORKSHEET_NAME).getRow(2).getCell(1).value,
    exportTripInterface.journey_id,
  );
});
