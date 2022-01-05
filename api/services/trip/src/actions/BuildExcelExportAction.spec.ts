/* eslint-disable max-len */
import { uuid } from '@pdc/helper-test/dist';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import anyTest, { TestFn } from 'ava';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResultInterface } from '../helpers/fakeCampaign.helper.spec';
import { ResultInterface as Campaign } from '../shared/policy/find.contract';
import { BuildExcelsExportAction } from './BuildExcelExportAction';
import { BuildExcel } from './excel/BuildExcel';
import { CheckCampaign } from './excel/CheckCampaign';
import { GetCampaignInvolvedOperator } from './excel/GetCampaignInvolvedOperators';

interface Context {
  // Injected tokens
  checkCampaign: CheckCampaign;
  s3StorageProvider: S3StorageProvider;
  buildExcel: BuildExcel;
  getCampaignInvolvedOperator: GetCampaignInvolvedOperator;

  // Injected tokens method's stubs
  checkCampaignStub: SinonStub;
  s3StorageProviderStub: SinonStub;
  buildExcelStub: SinonStub;
  getCampaignInvolvedOperatorStub: SinonStub;

  // Constants
  START_DATE_STRING: string;
  END_DATE_STRING: string;
  START_DATE: Date;
  END_DATE: Date;

  // Tested token
  buildExcelsExportAction: BuildExcelsExportAction;
}

const test = anyTest as TestFn<Partial<Context>>;

test.before((t) => {
  t.context.START_DATE_STRING = '2020-01-08T00:00:00Z';
  t.context.END_DATE_STRING = '2020-02-08T00:00:00Z';
  t.context.START_DATE = new Date(t.context.START_DATE_STRING);
  t.context.END_DATE = new Date(t.context.END_DATE_STRING);
});

test.beforeEach((t) => {
  t.context.checkCampaign = new CheckCampaign(null);
  t.context.s3StorageProvider = new S3StorageProvider(null);
  t.context.buildExcel = new BuildExcel(null, null, null);
  t.context.getCampaignInvolvedOperator = new GetCampaignInvolvedOperator(null);
  t.context.buildExcelsExportAction = new BuildExcelsExportAction(
    t.context.checkCampaign,
    t.context.s3StorageProvider,
    t.context.getCampaignInvolvedOperator,
    t.context.buildExcel,
  );

  t.context.checkCampaignStub = sinon.stub(t.context.checkCampaign, 'call');
  t.context.s3StorageProviderStub = sinon.stub(t.context.s3StorageProvider, 'upload');
  t.context.buildExcelStub = sinon.stub(t.context.buildExcel, 'call');
  t.context.getCampaignInvolvedOperatorStub = sinon.stub(t.context.getCampaignInvolvedOperator, 'call');
});

test.afterEach((t) => {
  t.context.checkCampaignStub.restore();
  t.context.s3StorageProviderStub.restore();
});

test('BuildExcelExportAction: should create 1 xlsx file for last month if no date range provided, 1 campaign with 1 operator', async (t) => {
  // Arrange
  const campaign: Campaign = createGetCampaignResultInterface('active');
  const filename = `campaign-${uuid()}.xlsx`;
  const filepath = `/tmp/exports/${filename}`;
  t.context.checkCampaignStub.resolves(campaign);
  t.context.buildExcelStub.resolves(filepath);
  t.context.s3StorageProviderStub.resolves(filename);
  t.context.getCampaignInvolvedOperatorStub.resolves([4]);

  // Act
  const result = await t.context.buildExcelsExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [campaign._id],
      },
    },
    null,
  );

  // Assert
  const endDate = new Date();
  endDate.setDate(1);
  endDate.setHours(0, 0, 0, -1);
  const startDate = new Date(endDate.valueOf());
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  t.deepEqual(result, [filename]);
  sinon.assert.calledOnceWithMatch(t.context.checkCampaignStub, campaign._id);
  sinon.assert.called(t.context.s3StorageProviderStub);
  t.true(
    new Date(t.context.checkCampaignStub.args[0][1]).toISOString().split('T')[0] ===
      startDate.toISOString().split('T')[0],
  );
  t.true(
    new Date(t.context.checkCampaignStub.args[0][2]).toISOString().split('T')[0] ===
      endDate.toISOString().split('T')[0],
  );
});

test('BuildExcelExportAction: should create 1 xlsx file if date range provided and 1 campaign id', async (t) => {
  // Arrange
  const campaign: Campaign = createGetCampaignResultInterface('active');
  const filename = `campaign-${uuid()}.xlsx`;
  const filepath = `/tmp/exports/${filename}`;
  const s3_key: string = faker.system.fileName();
  t.context.checkCampaignStub.resolves(campaign);
  t.context.buildExcelStub.resolves(filepath);
  t.context.s3StorageProviderStub.resolves(s3_key);
  t.context.getCampaignInvolvedOperatorStub.resolves([4]);

  // Act
  const result: string[] = await t.context.buildExcelsExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [campaign._id],
        date: {
          start: t.context.START_DATE_STRING,
          end: t.context.END_DATE_STRING,
        },
      },
      // Cast to check date type conversion
    } as any,
    null,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.checkCampaignStub,
    campaign._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  sinon.assert.calledOnceWithExactly(t.context.s3StorageProviderStub, BucketName.Export, filepath);
  sinon.assert.calledOnceWithExactly(
    t.context.getCampaignInvolvedOperatorStub,
    campaign,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  t.deepEqual(result, [s3_key]);
});

test('BuildExcelExportAction: should create 4 xlsx file if date range provided and 2 campaigns with 2 operators each', async (t) => {
  // Arrange
  const campaign1: Campaign = createGetCampaignResultInterface('active');
  const campaign2: Campaign = createGetCampaignResultInterface('active');
  const expectedFiles: string[] = [0, 1, 2, 3].map((i) => {
    const filename = `${faker.system.fileName()}.xlsx`;
    t.context.buildExcelStub.onCall(i).resolves(`/tmp/exports/${filename}`);
    t.context.s3StorageProviderStub.onCall(i).resolves(filename);
    return filename;
  });
  t.context.checkCampaignStub.withArgs(campaign1._id).resolves(campaign1);
  t.context.checkCampaignStub.withArgs(campaign2._id).resolves(campaign2);
  t.context.getCampaignInvolvedOperatorStub.resolves([4, 5]);

  // Act
  const result = await t.context.buildExcelsExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [campaign1._id, campaign2._id],
        date: {
          start: t.context.START_DATE_STRING,
          end: t.context.END_DATE_STRING,
        },
      },
      // Cast to check date type conversion
    } as any,
    null,
  );

  // Assert
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub.firstCall,
    campaign1._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub.secondCall,
    campaign2._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  t.deepEqual(result, expectedFiles);
  t.is(t.context.checkCampaignStub.args[0][0], campaign1._id);
  t.is(t.context.checkCampaignStub.args[1][0], campaign2._id);
});

test('BuildExcelExportAction: should send error and process other if 1 export failed', async (t) => {
  // Arrange
  const campaign1: Campaign = createGetCampaignResultInterface('active');
  const campaign2: Campaign = createGetCampaignResultInterface('active');
  t.context.checkCampaignStub.withArgs(campaign1._id).resolves(campaign1);
  t.context.checkCampaignStub.withArgs(campaign2._id).resolves(campaign2);
  t.context.getCampaignInvolvedOperatorStub.resolves([4, 5]);
  const filename = `${faker.system.fileName()}.xlsx`;
  t.context.buildExcelStub.resolves(`/tmp/exports/${filename}`);
  t.context.s3StorageProviderStub.resolves(filename);
  t.context.buildExcelStub.onCall(3).rejects(`Error`);

  // Act
  const result = await t.context.buildExcelsExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [campaign1._id, campaign2._id],
        date: {
          start: t.context.START_DATE_STRING,
          end: t.context.END_DATE_STRING,
        },
      },
      // Cast to check date type conversion
    } as any,
    null,
  );

  // Assert
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub.firstCall,
    campaign1._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub.secondCall,
    campaign2._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  t.deepEqual(
    result.sort(),
    [
      filename,
      filename,
      `Error processing excel export for campaign ${campaign2.name} and operator id 5`,
      filename,
    ].sort(),
  );
  t.is(t.context.checkCampaignStub.args[0][0], campaign1._id);
  t.is(t.context.checkCampaignStub.args[1][0], campaign2._id);
});

test('BuildExcelExportAction: should throw InvalidParam if at least 1 campaign_id is not provided', async (t) => {
  // Act
  await t.throwsAsync(async () => {
    await t.context.buildExcelsExportAction.handle(
      { format: { tz: 'Europe/Paris' }, query: { campaign_id: null } },
      null,
    );
  });

  // Assert
  sinon.assert.notCalled(t.context.checkCampaignStub);
  sinon.assert.notCalled(t.context.s3StorageProviderStub);
});
