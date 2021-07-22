import { Workbook } from 'exceljs'
import test from 'ava';
import sinon from 'sinon';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';
import { StreamDataToWorkBookSheet } from './StreamDataToWorkBookSheet';
import faker from 'faker';

let buildExcelFileForCampaign: BuildExcelFileForCampaign;
let excelWorkbookHandler: ExcelWorkbookHandler;
let streamTripsForCampaginComponent: StreamDataToWorkBookSheet;

const CAMPAIGN_ID: number = faker.random.number();
const RETURNED_EXCEL_PATH: string= faker.system.directoryPath();
const TEMPLATE_WORKBOOK: Workbook = new Workbook();
const GENERATED_WORKBOOK: Workbook = new Workbook();

test.before((t) => {
  excelWorkbookHandler = new ExcelWorkbookHandler();
  streamTripsForCampaginComponent = new StreamDataToWorkBookSheet(null);
  buildExcelFileForCampaign = new BuildExcelFileForCampaign(excelWorkbookHandler, streamTripsForCampaginComponent);
})

test('BuildExcelFileForCampaign : should return path to excel file', async (t) => {
  // Arrange
  const streamTripsForCampaginComponentStub = sinon.stub(streamTripsForCampaginComponent, 'call');
  streamTripsForCampaginComponentStub.resolves(GENERATED_WORKBOOK)

  const loadWorkkBookStub = sinon.stub(excelWorkbookHandler, 'loadWorkbookTemplate')
  loadWorkkBookStub.resolves(TEMPLATE_WORKBOOK)

  const writeWorkBookToTempFileStub = sinon.stub(excelWorkbookHandler, 'writeWorkbookToTempFile')
  writeWorkBookToTempFileStub.resolves(RETURNED_EXCEL_PATH)

  const startDate: Date = new Date();
  const endDate: Date = startDate;

  // Act
  const excelPath: string = await buildExcelFileForCampaign.call(CAMPAIGN_ID, new Date(), new Date());

  // Assert
  sinon.assert.calledWith(streamTripsForCampaginComponentStub, CAMPAIGN_ID, TEMPLATE_WORKBOOK,startDate, endDate)
  sinon.assert.called(writeWorkBookToTempFileStub)
  t.is(excelPath, RETURNED_EXCEL_PATH)
})