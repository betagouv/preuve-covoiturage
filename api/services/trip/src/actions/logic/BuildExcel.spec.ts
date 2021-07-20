import test from 'ava';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';

let excelWorkbookHandler: ExcelWorkbookHandler;

test.before((t) => {
  excelWorkbookHandler = new ExcelWorkbookHandler();
})

test('BuildExcel: should throw NotFound exception if no campaign with id', async (t) => {
  // Arrange
 //  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 

  // Assert
})

test('BuildExcel: should throw exception if no active campaign for that period', async (t) => {
  // Arrange
 //  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 

  // Assert
})


test('BuildExcel: should create xlsx file', async (t) => {
  // Arrange
 //  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 

  // Assert
})