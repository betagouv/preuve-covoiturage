import test from 'ava';
import { Workbook } from 'exceljs';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';
import { StreamTripsForCamaignComponent } from './StreamTripsForCamaignComponent';
import { exportTripInterface as eti} from './writeToWorkbookSheet.spec';


let streamTripsForCampaginComponent: StreamTripsForCamaignComponent;

let tripRepositoryProvider: TripRepositoryProvider;

let tripRepositoryProviderStub: SinonStub

test.before((t) => {
  tripRepositoryProvider = new TripRepositoryProvider(null)
  streamTripsForCampaginComponent = new StreamTripsForCamaignComponent(tripRepositoryProvider, new ExcelWorkbookHandler());
})

test('StreamTripsForCampaignComponent: should stream 20 rows 10 by ten', async (t) => {
  // Arrange
  const cursorResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([eti, eti, eti, eti, eti, eti, eti, eti, eti, eti]);
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

  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  tripRepositoryProviderStub.resolves(returnedFunction)
  
  // Act
  const updatedWorkbook: Workbook = await streamTripsForCampaginComponent.call(896523)
  
  // Assert
  sinon.assert.called(tripRepositoryProviderStub)
  t.true(updatedWorkbook !== undefined)
  t.is(updatedWorkbook.getWorksheet('data').rowCount, 21)
});

// test('StreamTripsForCampaignComponent: should return a valid excel file path', async (t) => {
//   // Arrange
//   const cursorResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
//     resolve([eti, eti, eti, eti, eti, eti, eti, eti, eti, eti]);
//   })

//   const cursorEndingResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
//     resolve([]);
//   })
//   let counter: number = 20;
//   let returnedFunction = (count: number): Promise<ExportTripInterface[]> => {
//     if(counter <= 0 ) {
//       return cursorEndingResult
//     }
//     counter = counter - 10;
//     return cursorResult;
//   }

//   tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
//   tripRepositoryProviderStub.resolves(returnedFunction)
  
//   // Act
//   const excelFilepath: string = await streamTripsForCampaginComponent.getExcelFile(896523)
  
//   // Assert
//   sinon.assert.called(tripRepositoryProviderStub)
//   t.true(excelFilepath !== undefined)
// });