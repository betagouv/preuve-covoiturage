
import test from 'ava';
import sinon, { SinonStub } from 'sinon';
import faker from 'faker';
import { writeToExcelSheet } from './writeToExcelSheet';
import { TableColumnProperties, Workbook, Worksheet } from 'exceljs';
import { ExportTripInterface } from '../../interfaces';
import { BuildExportAction, FlattenTripInterface } from '../BuildExportAction';


const exportTripRow: ExportTripInterface<Date> = {
  journey_id: faker.random.uuid(),
  trip_id: faker.random.uuid(),

  journey_start_datetime: faker.date.past(2),
  journey_start_lon: faker.address.longitude(),
  journey_start_lat: faker.address.longitude(),
  journey_start_insee: "",
  journey_start_postalcode: faker.address.zipCode(),
  journey_start_department: faker.address.countryCode(),
  journey_start_town: faker.address.city(),
  journey_start_towngroup: "",
  journey_start_country: faker.address.country(),

  journey_end_datetime: faker.date.future(2),
  journey_end_lon: faker.address.longitude(),
  journey_end_lat: faker.address.latitude(),
  journey_end_insee: "",
  journey_end_postalcode: faker.address.zipCode(),
  journey_end_department: faker.address.countryCode(),
  journey_end_town: faker.address.city(),
  journey_end_towngroup: "",
  journey_end_country: faker.address.country(),

  driver_card: false,
  passenger_card: false,
  passenger_over_18: true,
  passenger_seats: 1,
  operator_class: "C",

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
}

// const exportTripRow: FlattenTripInterface = {
//   journey_id: faker.random.uuid(),
//   trip_id: faker.random.uuid(),

//   journey_start_date: faker.date.past(2).toISOString(),
//   journey_start_time: faker.date.past(2).toISOString(),
//   journey_start_datetime: faker.date.past(2).toISOString(),
//   journey_start_lon: faker.address.longitude(),
//   journey_start_lat: faker.address.longitude(),
//   journey_start_insee: "",
//   journey_start_postalcode: faker.address.zipCode(),
//   journey_start_department: faker.address.countryCode(),
//   journey_start_town: faker.address.city(),
//   journey_start_towngroup: "",
//   journey_start_country: faker.address.country(),

//   journey_end_date: faker.date.future(2).toISOString(),
//   journey_end_time: faker.date.future(2).toISOString(),
//   journey_end_datetime: faker.date.future(2).toISOString(),
//   journey_end_lon: faker.address.longitude(),
//   journey_end_lat: faker.address.latitude(),
//   journey_end_insee: "",
//   journey_end_postalcode: faker.address.zipCode(),
//   journey_end_department: faker.address.countryCode(),
//   journey_end_town: faker.address.city(),
//   journey_end_towngroup: "",
//   journey_end_country: faker.address.country(),

//   driver_card: false,
//   passenger_card: false,
//   passenger_over_18: true,
//   passenger_seats: 1,
//   operator_class: "C",

//   journey_distance: 865,
//   journey_duration: 78,
//   journey_distance_anounced: 800,
//   journey_distance_calculated: 800,
//   journey_duration_anounced: 800,
//   journey_duration_calculated: 800,

//   passenger_id: faker.random.uuid(),
//   passenger_contribution: 8,
//   passenger_incentive_raw: null,
//   passenger_incentive_rpc_raw: null,

//   driver_id: faker.random.uuid(),
//   driver_revenue: 75,
//   driver_incentive_raw: null,
//   driver_incentive_rpc_raw: null,
// }

const data : ExportTripInterface<Date>[] = [exportTripRow,exportTripRow, exportTripRow]

test('writeToExcelSheet: should write raws in excel workbook', async (t) => {
  // Arrange
  const wb: Workbook = new Workbook()
  const worksheet: Worksheet = wb.addWorksheet('data');
  BuildExportAction.financialFields

  const headers: string[]= [...BuildExportAction.baseFields, ...BuildExportAction.financialFields]

  worksheet.addTable({ name: 'Données', ref: 'A1',  style: {
    theme: 'TableStyleDark3',
    showRowStripes: true,
  }, columns: headers.map(h => {
    let columnProperty: TableColumnProperties = {
      filterButton: true,
      name: h,
    };
    return columnProperty
  }), rows: []})
  // worksheet.commit()

  // Act
  // console.error('worksheet => ' +  worksheet.getTable('Donneés'))
  const modifiedWorkbook: Workbook = writeToExcelSheet(wb, data);

  // Assert
  // t.is(modifiedWorkbook.getWorksheet('data').actualRowCount,4)
  t.is(modifiedWorkbook.getWorksheet('data').rowCount, 4)
  // t.is(modifiedWorkbook.getWorksheet('data').getTable('Donneés').rows.length, 4 )
})
