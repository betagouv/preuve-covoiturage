
import test from 'ava';
import faker from 'faker';
import { Workbook } from 'exceljs';
import sinon, { SinonStub } from 'sinon';
import { ExportTripInterface } from '../../interfaces';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { StreamDataToWorkBookSheet } from './StreamDataToWorkBookSheet';


export const exportTripInterface: ExportTripInterface<Date> = {
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

let streamTripsForCampaginComponent: StreamDataToWorkBookSheet;
let tripRepositoryProvider: TripRepositoryProvider;

let tripRepositoryProviderStub: SinonStub

const date: Date = faker.date.past();
const campaign_id: number = faker.random.number();

test.before((t) => {
  tripRepositoryProvider = new TripRepositoryProvider(null)
  streamTripsForCampaginComponent = new StreamDataToWorkBookSheet(tripRepositoryProvider);
})

test('StreamDataToWorkBookSheet: should stream 20 rows to workbook', async (t) => {
  // Arrange
  const cursorResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface, exportTripInterface]);
  })

  const cursorEndingResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([]);
  })
  let counter: number = 20;
  let returnedFunction = (count: number): Promise<ExportTripInterface[]> => {
    if(counter <= 0 ) {
      return cursorEndingResult
    }
    counter = counter - 10;
    return cursorResult;
  }

  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursor');
  tripRepositoryProviderStub.resolves(returnedFunction)

  const wb: Workbook = new Workbook()
  wb.addWorksheet('data');
  
  // Act
  const generatedWorkbook: Workbook = await streamTripsForCampaginComponent.call(campaign_id, wb, date, date)
  
  // Assert
  sinon.assert.calledOnceWithExactly(tripRepositoryProviderStub, { date: { start: date, end: date }, campaign_id: [campaign_id]})
  t.is(generatedWorkbook.getWorksheet('data').rowCount, 20)
});


// test('StreamDataToWorkBookSheet: should write raws in workbook', async (t) => {
//   // Arrange
//   const wb: Workbook = new Workbook()
//   const worksheet: Worksheet = wb.addWorksheet('data');
//   // const headers: string[]= [...BuildExportAction.baseFields, ...BuildExportAction.financialFields]

//   // worksheet.addTable({ name: 'Données', ref: 'A1',  style: {
//   //   theme: 'TableStyleDark3',
//   //   showRowStripes: true,
//   // }, columns: headers.map(h => {
//   //   let columnProperty: TableColumnProperties = {
//   //     filterButton: true,
//   //     name: h,
//   //   };
//   //   return columnProperty
//   // }), rows: []})
//   // worksheet.commit()

//   // Act
//   // console.error('worksheet => ' +  worksheet.getTable('Donneés'))
//   writeToWorkbookSheet(wb, data);

//   // Assert
//   t.is(wb.getWorksheet('data').actualRowCount, 4)
// })
