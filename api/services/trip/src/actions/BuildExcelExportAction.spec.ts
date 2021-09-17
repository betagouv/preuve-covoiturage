/* eslint-disable max-len */
import { uuid } from '@pdc/helper-test/dist';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import anyTest, { TestInterface } from 'ava';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResultInterface } from '../helpers/fakeCampaign.helper.spec';
import { ResultInterface as Campaign } from '../shared/policy/find.contract';
import { BuildExcelsExportAction } from './BuildExcelExportAction';
import { BuildExcelFile } from './excel/BuildExcelFile';
import { CheckCampaign } from './excel/CheckCampaign';
import { GetCampaignInvolvedOperator } from './excel/GetCampaignInvolvedOperators';

interface Context {
  // Injected tokens
  checkCampaign: CheckCampaign;
  s3StorageProvider: S3StorageProvider;
  buildExcel: BuildExcelFile;
  getCampaignInvolvedOperator: GetCampaignInvolvedOperator;

  // Injected tokens method's stubs
  checkCampaignStub: SinonStub;
  s3StorageProviderStub: SinonStub;
  buildExcelStub: SinonStub;
  getCampaignInvolvedOperatorStub: SinonStub;

  // Constants
  CAMPAIGN_ID: number;

  // Tested token
  buildExcelsExportAction: BuildExcelsExportAction;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.checkCampaign = new CheckCampaign(null);
  t.context.s3StorageProvider = new S3StorageProvider();
  t.context.buildExcel = new BuildExcelFile(null, null);
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

test('BuildExcelExportAction: should create 1 xlsx file if no date range provided, 1 campaign with 1 operator', async (t) => {
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
  t.deepEqual(result, [filename]);
  sinon.assert.calledOnceWithExactly(t.context.checkCampaignStub, campaign._id, null, null);
  sinon.assert.called(t.context.s3StorageProviderStub);
  t.is(t.context.checkCampaignStub.args[0][0], campaign._id);
});

test('BuildExcelExportAction: should create 1 xlsx file if date range provided and 1 campaign id', async (t) => {
  // Arrange
  const campaign: Campaign = createGetCampaignResultInterface('active');
  const filename = `campaign-${uuid()}.xlsx`;
  const filepath = `/tmp/exports/${filename}`;
  t.context.checkCampaignStub.resolves(campaign);
  t.context.buildExcelStub.resolves(filepath);
  t.context.s3StorageProviderStub.resolves('s3-key');
  t.context.getCampaignInvolvedOperatorStub.resolves([4]);

  // Act
  await t.context.buildExcelsExportAction.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [campaign._id],
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
    t.context.checkCampaignStub,
    campaign._id,
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
  );
  sinon.assert.calledOnceWithExactly(t.context.s3StorageProviderStub, BucketName.Export, filepath);
  t.is(t.context.checkCampaignStub.args[0][0], campaign._id);
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
    t.context.checkCampaignStub.firstCall,
    campaign1._id,
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
  );
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub.secondCall,
    campaign2._id,
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
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
    t.context.checkCampaignStub.firstCall,
    campaign1._id,
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
  );
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub.secondCall,
    campaign2._id,
    new Date('2020-01-08T00:00:00Z'),
    new Date('2020-02-08T00:00:00Z'),
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
