// import faker from '@faker-js/faker';
// import test from 'ava';
// import { stream, Workbook, Worksheet } from 'exceljs';
// import { ExportCron } from '../../../cron/ExportCron';
// import { APDFTripInterface } from '../../../interfaces/APDFTripInterface';
// import { BuildExcel } from '../BuildExcel';
// import { DataWorkBookWriter } from './DataWorkbookWriter';

// let dataWorkBookWriter: DataWorkBookWriter;

// const exportTripInterface: APDFTripInterface = {
//   journey_id: faker.datatype.uuid(),
//   trip_id: faker.datatype.uuid(),
//   operator_trip_id: faker.datatype.uuid(),
//   driver_uuid: faker.datatype.uuid(),
//   operator_driver_id: faker.datatype.uuid(),
//   driver_rpc_incentive: faker.datatype.number(1000),
//   passenger_uuid: faker.datatype.uuid(),
//   operator_passenger_id: faker.datatype.uuid(),
//   passenger_rpc_incentive: faker.datatype.number(1000),
//   start_datetime: faker.date.past(2).toISOString(),
//   end_datetime: faker.date.future(2).toISOString(),
//   start_location: faker.address.cityName(),
//   start_insee: faker.random.numeric(5, { allowLeadingZeros: true }),
//   end_location: faker.address.cityName(),
//   end_insee: faker.random.numeric(5, { allowLeadingZeros: true }),
//   distance: faker.datatype.number({ min: 1_500, max: 150_000 }),
//   duration: faker.datatype.number({ min: 300, max: 3600 }),
//   operator_class: 'C',

//   // operator: faker.random.alphaNumeric(),
//   // passenger_over_18: true,
//   // passenger_seats: 1,

//   // start_lon: faker.address.longitude(),
//   // start_lat: faker.address.longitude(),
//   // start_insee: '',
//   // start_department: faker.address.countryCode(),
//   // start_town: faker.address.city(),
//   // start_towngroup: '',
//   // start_country: faker.address.country(),

//   // end_lon: faker.address.longitude(),
//   // end_lat: faker.address.latitude(),
//   // end_insee: '',
//   // end_department: faker.address.countryCode(),
//   // end_town: faker.address.city(),
//   // end_towngroup: '',
//   // end_country: faker.address.country(),
// };

// test.before((t) => {
//   dataWorkBookWriter = new DataWorkBookWriter();
// });

// test('DataWorkBookWriter: should stream data to a workbook file', async (t) => {
//   // Arrange
//   const tripCursor = new Promise<APDFTripInterface[]>((resolve, reject) => {
//     resolve([
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//       exportTripInterface,
//     ]);
//   });
//   const cursorEndingResult = new Promise<APDFTripInterface[]>((resolve, reject) => {
//     resolve([]);
//   });
//   let counter = 20;
//   const cursorCallback = (count: number): Promise<APDFTripInterface[]> => {
//     if (counter <= 0) {
//       return cursorEndingResult;
//     }
//     counter = counter - 10;
//     return tripCursor;
//   };

//   const filepath = '/tmp/stream-data-test.xlsx';

//   // Act
//   const workbookWriter: stream.xlsx.WorkbookWriter = BuildExcel.initWorkbookWriter(filepath);
//   await dataWorkBookWriter.call({ read: cursorCallback, release: () => {} }, workbookWriter);
//   await workbookWriter.commit();

//   // Assert
//   const workbook: Workbook = await new Workbook().xlsx.readFile(filepath);
//   const worksheet: Worksheet = workbook.getWorksheet(dataWorkBookWriter.DATA_WORKSHEET_NAME);
//   t.is(worksheet.actualRowCount, 21);
//   t.deepEqual(workbook.getWorksheet(dataWorkBookWriter.DATA_WORKSHEET_NAME).getRow(1).values, [
//     undefined,
//     ...ExportCron.getColumns('territory'),
//   ]);
//   t.is(
//     workbook.getWorksheet(dataWorkBookWriter.DATA_WORKSHEET_NAME).getRow(2).values.length,
//     ExportCron.getColumns('territory').length + 1,
//   );
//   t.is(
//     workbook.getWorksheet(dataWorkBookWriter.DATA_WORKSHEET_NAME).getRow(2).getCell(2).value,
//     exportTripInterface.trip_id,
//   );
// });
