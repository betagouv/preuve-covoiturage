import anyTest, { TestInterface } from 'ava';
import { Workbook } from 'exceljs';
import faker from 'faker';
import sinon from 'sinon';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';
import { StreamDataToWorkBookSheet } from './StreamDataToWorkBookSheet';

interface Context {
  // Injected tokens
  excelWorkbookHandler: ExcelWorkbookHandler;
  streamTripsForCampaginComponent: StreamDataToWorkBookSheet;

  // Constants
  CAMPAIGN_ID: number;
  CAMPAIGN_NAME: string;
  RETURNED_EXCEL_PATH;
  TEMPLATE_WORKBOOK: Workbook;
  GENERATED_WORKBOOK: Workbook;

  // Tested token
  buildExcelFileForCampaign: BuildExcelFileForCampaign;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.excelWorkbookHandler = new ExcelWorkbookHandler();
  t.context.streamTripsForCampaginComponent = new StreamDataToWorkBookSheet(null);
  t.context.buildExcelFileForCampaign = new BuildExcelFileForCampaign(
    t.context.excelWorkbookHandler,
    t.context.streamTripsForCampaginComponent,
  );

  t.context.CAMPAIGN_ID = faker.random.number();
  t.context.CAMPAIGN_NAME = faker.random.alphaNumeric();
  t.context.RETURNED_EXCEL_PATH = faker.system.directoryPath();
  t.context.TEMPLATE_WORKBOOK = new Workbook();
  t.context.GENERATED_WORKBOOK = new Workbook();
});

test('BuildExcelFileForCampaign: should return path to excel file', async (t) => {
  // Arrange
  const streamTripsForCampaginComponentStub = sinon.stub(t.context.streamTripsForCampaginComponent, 'call');
  streamTripsForCampaginComponentStub.resolves(t.context.GENERATED_WORKBOOK);
  const date: Date = faker.date.past();

  const loadWorkkBookStub = sinon.stub(t.context.excelWorkbookHandler, 'loadWorkbookTemplate');
  loadWorkkBookStub.resolves(t.context.TEMPLATE_WORKBOOK);

  const writeWorkBookToTempFileStub = sinon.stub(t.context.excelWorkbookHandler, 'writeWorkbookToTempFile');
  writeWorkBookToTempFileStub.resolves(t.context.RETURNED_EXCEL_PATH);

  // Act
  const excelPath: string = await t.context.buildExcelFileForCampaign.call(
    t.context.CAMPAIGN_ID,
    date,
    date,
    t.context.CAMPAIGN_NAME,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    streamTripsForCampaginComponentStub,
    t.context.CAMPAIGN_ID,
    t.context.TEMPLATE_WORKBOOK,
    date,
    date,
  );
  sinon.assert.calledOnceWithExactly(
    writeWorkBookToTempFileStub,
    t.context.GENERATED_WORKBOOK,
    t.context.CAMPAIGN_NAME,
  );
  t.is(excelPath, t.context.RETURNED_EXCEL_PATH);
});
