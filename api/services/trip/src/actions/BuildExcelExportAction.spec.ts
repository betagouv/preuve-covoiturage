import test, { serial } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { BuildExcelExportAction } from './BuildExcelExportAction';
import { GetCampaignAndCallBuildExcel } from './logic/GetCampaignAndCallBuildExcel';
import faker from 'faker';


let buildExcelExportAction: BuildExcelExportAction;
let getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel;

let getCampaignAndCallBuildExcelStub: SinonStub;

const CAMPAIGN_ID = faker.random.number();

test.before((t) => {
  getCampaignAndCallBuildExcel = new GetCampaignAndCallBuildExcel(null, null)
  buildExcelExportAction = new BuildExcelExportAction(getCampaignAndCallBuildExcel)
})

test.beforeEach(t => {
  getCampaignAndCallBuildExcelStub = sinon.stub(getCampaignAndCallBuildExcel, 'call');
})

test.afterEach((t) => {
  getCampaignAndCallBuildExcelStub.restore();
})

serial('BuildExcelExportAction: should create 1 xlsx file if no date range provided and 1 campaign id', async (t) => {
  // Arrange
  getCampaignAndCallBuildExcelStub.resolves("my-file.xlsx")

  // Act 
  await buildExcelExportAction.handle({ format: { tz: 'Europe/Paris'}, query : {
    campaign_id: [CAMPAIGN_ID]
  }}, null)

  // Assert
  sinon.assert.calledOnceWithExactly(getCampaignAndCallBuildExcelStub, CAMPAIGN_ID, null, null)
  t.pass()
})

serial('BuildExcelExportAction: should throw BadRequestException if at least one of campaign_id or territory_id is not provided', async (t) => {
  // Arrange

  // Act 
  await t.throwsAsync(async () => {
    await buildExcelExportAction.handle({ format: { tz: 'Europe/Paris'}, query : { }}, null)
  })

  // Assert
  sinon.assert.notCalled(getCampaignAndCallBuildExcelStub)
})