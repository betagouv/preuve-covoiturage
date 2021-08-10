import { Workbook } from 'exceljs';
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
const CAMPAIGN_NAME: string = faker.random.alphaNumeric();
const RETURNED_EXCEL_PATH: string = faker.system.directoryPath();
const TEMPLATE_WORKBOOK: Workbook = new Workbook();
const GENERATED_WORKBOOK: Workbook = new Workbook();

const date: Date = faker.date.past();

test.before((t) => {
  excelWorkbookHandler = new ExcelWorkbookHandler();
  streamTripsForCampaginComponent = new StreamDataToWorkBookSheet(null);
  buildExcelFileForCampaign = new BuildExcelFileForCampaign(excelWorkbookHandler, streamTripsForCampaginComponent);
});

test('BuildExcelFileForCampaign: should return path to excel file', async (t) => {
  // Arrange
  const streamTripsForCampaginComponentStub = sinon.stub(streamTripsForCampaginComponent, 'call');
  streamTripsForCampaginComponentStub.resolves(GENERATED_WORKBOOK);

  const loadWorkkBookStub = sinon.stub(excelWorkbookHandler, 'loadWorkbookTemplate');
  loadWorkkBookStub.resolves(TEMPLATE_WORKBOOK);

  const writeWorkBookToTempFileStub = sinon.stub(excelWorkbookHandler, 'writeWorkbookToTempFile');
  writeWorkBookToTempFileStub.resolves(RETURNED_EXCEL_PATH);

  // Act
  const excelPath: string = await buildExcelFileForCampaign.call(CAMPAIGN_ID, date, date, CAMPAIGN_NAME);

  // Assert
  sinon.assert.calledOnceWithExactly(streamTripsForCampaginComponentStub, CAMPAIGN_ID, TEMPLATE_WORKBOOK, date, date);
  sinon.assert.calledOnceWithExactly(writeWorkBookToTempFileStub, GENERATED_WORKBOOK, CAMPAIGN_NAME);
  t.is(excelPath, RETURNED_EXCEL_PATH);
});
