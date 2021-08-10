import { S3StorageProvider, BucketName } from '@pdc/provider-file';
import test, { serial } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { BuildExcelExportAction } from './BuildExcelExportAction';
import { GetCampaignAndCallBuildExcel } from './excel/GetCampaignAndCallBuildExcel';
import faker from 'faker';
import { uuid } from '@pdc/helper-test/dist';

let buildExcelExportAction: BuildExcelExportAction;
let getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel;
let s3StorageProvider: S3StorageProvider;

let getCampaignAndCallBuildExcelStub: SinonStub;
let s3StorageProviderStub: SinonStub;

const CAMPAIGN_ID = faker.random.number();

test.before((t) => {
  getCampaignAndCallBuildExcel = new GetCampaignAndCallBuildExcel(null, null);
  s3StorageProvider = new S3StorageProvider();
  buildExcelExportAction = new BuildExcelExportAction(getCampaignAndCallBuildExcel, s3StorageProvider);
});

test.beforeEach((t) => {
  getCampaignAndCallBuildExcelStub = sinon.stub(getCampaignAndCallBuildExcel, 'call');
  s3StorageProviderStub = sinon.stub(s3StorageProvider, 'upload');
});

test.afterEach((t) => {
  getCampaignAndCallBuildExcelStub.restore();
  s3StorageProviderStub.restore();
});

serial('BuildExcelExportAction: should create 1 xlsx file if no date range provided and 1 campaign id', async (t) => {
  // Arrange
  const filepath = '/tmp/exports/campaign-' + uuid() + '.xlsx';
  getCampaignAndCallBuildExcelStub.resolves(filepath);
  s3StorageProviderStub.resolves('s3-key');

  // Act
  await buildExcelExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [CAMPAIGN_ID],
      },
    },
    null,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(getCampaignAndCallBuildExcelStub, CAMPAIGN_ID, null, null);
  sinon.assert.calledOnceWithExactly(s3StorageProviderStub, BucketName.Export, filepath);
  t.pass();
});

serial(
  'BuildExcelExportAction: should throw BadRequestException if at least 1 campaign_id or territory_id is not provided',
  async (t) => {
    // Arrange

    // Act
    await t.throwsAsync(async () => {
      await buildExcelExportAction.handle({ format: { tz: 'Europe/Paris' }, query: {} }, null);
    });

    // Assert
    sinon.assert.notCalled(getCampaignAndCallBuildExcelStub);
    sinon.assert.notCalled(s3StorageProviderStub);
  },
);
