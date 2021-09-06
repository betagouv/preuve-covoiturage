import { S3StorageProvider, BucketName } from '@pdc/provider-file';
import anyTest, { TestInterface } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { BuildExcelExportAction } from './BuildExcelExportAction';
import { GetCampaignAndCallBuildExcel } from './excel/GetCampaignAndCallBuildExcel';
import faker from 'faker';
import { uuid } from '@pdc/helper-test/dist';

interface Context {
  // Injected tokens
  getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel;
  s3StorageProvider: S3StorageProvider;

  // Injected tokens method's stubs
  getCampaignAndCallBuildExcelStub: SinonStub;
  s3StorageProviderStub: SinonStub;

  // Constants
  CAMPAIGN_ID: number;

  // Tested token
  buildExcelExportAction: BuildExcelExportAction;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.getCampaignAndCallBuildExcel = new GetCampaignAndCallBuildExcel(null, null);
  t.context.s3StorageProvider = new S3StorageProvider();
  t.context.buildExcelExportAction = new BuildExcelExportAction(
    t.context.getCampaignAndCallBuildExcel,
    t.context.s3StorageProvider,
  );

  t.context.getCampaignAndCallBuildExcelStub = sinon.stub(t.context.getCampaignAndCallBuildExcel, 'call');
  t.context.s3StorageProviderStub = sinon.stub(t.context.s3StorageProvider, 'upload');
  t.context.CAMPAIGN_ID = faker.random.number();
});

test.afterEach((t) => {
  t.context.getCampaignAndCallBuildExcelStub.restore();
  t.context.s3StorageProviderStub.restore();
});

test('BuildExcelExportAction: should create 1 xlsx file if no date range provided and 1 campaign id', async (t) => {
  // Arrange
  const FILEPATHES = [`/tmp/exports/campaign-${uuid()}.xlsx`];
  t.context.getCampaignAndCallBuildExcelStub.resolves(FILEPATHES);
  t.context.s3StorageProviderStub.resolves('s3-key');

  // Act
  await t.context.buildExcelExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [t.context.CAMPAIGN_ID],
      },
    },
    null,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(t.context.getCampaignAndCallBuildExcelStub, t.context.CAMPAIGN_ID, null, null);
  sinon.assert.calledOnceWithExactly(t.context.s3StorageProviderStub, BucketName.Export, FILEPATHES[0]);
  t.is(t.context.getCampaignAndCallBuildExcelStub.args[0][0], t.context.CAMPAIGN_ID);
});

test('BuildExcelExportAction: should create 1 xlsx file if date range provided and 1 campaign id', async (t) => {
  // Arrange
  const FILEPATHES = [`/tmp/exports/campaign-${uuid()}.xlsx`];
  t.context.getCampaignAndCallBuildExcelStub.resolves(FILEPATHES);
  t.context.s3StorageProviderStub.resolves('s3-key');

  // Act
  await t.context.buildExcelExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [t.context.CAMPAIGN_ID],
        date: {
          start: '2020-01-08T00:00:00Z',
          end: '2020-02-08T00:00:00Z',
        },
      },
      // Cast to check date type conversion
    } as any,
    null,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.getCampaignAndCallBuildExcelStub,
    t.context.CAMPAIGN_ID,
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
  );
  sinon.assert.calledOnceWithExactly(t.context.s3StorageProviderStub, BucketName.Export, FILEPATHES[0]);
  t.is(t.context.getCampaignAndCallBuildExcelStub.args[0][0], t.context.CAMPAIGN_ID);
});

// eslint-disable-next-line max-len
test('BuildExcelExportAction: should create 4 xlsx file if date range provided and 2 campaigns with 2 operators each', async (t) => {
  // Arrange
  const CAMPAIGN_IDS = [5, 8];
  const FILEPATHES = [
    `/tmp/exports/campaign-c1-op3-${uuid()}.xlsx`,
    `/tmp/exports/campaign-c1-op4-${uuid()}.xlsx`,
    `/tmp/exports/campaign-c2-op3-${uuid()}.xlsx`,
    `/tmp/exports/campaign-c2-op4-${uuid()}.xlsx`,
  ];
  t.context.getCampaignAndCallBuildExcelStub.resolves(FILEPATHES);
  t.context.s3StorageProviderStub.resolves('s3-key');

  // Act
  await t.context.buildExcelExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: CAMPAIGN_IDS,
        date: {
          start: '2020-01-08T00:00:00Z',
          end: '2020-02-08T00:00:00Z',
        },
      },
      // Cast to check date type conversion
    } as any,
    null,
  );

  // Assert
  sinon.assert.calledWithExactly(
    t.context.getCampaignAndCallBuildExcelStub.firstCall,
    CAMPAIGN_IDS[0],
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
  );
  sinon.assert.calledWithExactly(
    t.context.getCampaignAndCallBuildExcelStub.secondCall,
    CAMPAIGN_IDS[1],
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
  );
  FILEPATHES.forEach((f, i) =>
    sinon.assert.calledWithExactly(t.context.s3StorageProviderStub.getCall(i), BucketName.Export, FILEPATHES[i]),
  );
  t.is(t.context.getCampaignAndCallBuildExcelStub.args[0][0], CAMPAIGN_IDS[0]);
  t.is(t.context.getCampaignAndCallBuildExcelStub.args[1][0], CAMPAIGN_IDS[1]);
});

test('BuildExcelExportAction: should throw InvalidParam if at least 1 campaign_id is not provided', async (t) => {
  // Act
  await t.throwsAsync(async () => {
    await t.context.buildExcelExportAction.handle({ format: { tz: 'Europe/Paris' }, query: {} }, null);
  });

  // Assert
  sinon.assert.notCalled(t.context.getCampaignAndCallBuildExcelStub);
  sinon.assert.notCalled(t.context.s3StorageProviderStub);
});
