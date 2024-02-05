/* eslint-disable max-len */
import faker from '@faker-js/faker';
import { ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';
import { uuid } from '@pdc/helper-test';
import { BucketName, S3StorageProvider } from '@pdc/provider-storage';
import anyTest, { TestFn } from 'ava';
import { startOfMonth, subMonths } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResult } from '../helpers/createGetCampaignResult.helper';
import { DataRepositoryProviderInterfaceResolver } from '../interfaces/APDFRepositoryProviderInterface';
import { CheckCampaign } from '../providers/CheckCampaign';
import { BuildExcel } from '../providers/excel/BuildExcel';
import { ResultInterface as Campaign } from '../shared/policy/find.contract';
import { ExportAction } from './ExportAction';

interface Context {
  // Injected tokens
  kernel: KernelInterfaceResolver;
  checkCampaign: CheckCampaign;
  s3StorageProvider: S3StorageProvider;
  buildExcel: BuildExcel;
  apdfRepository: DataRepositoryProviderInterfaceResolver;
  config: ConfigInterfaceResolver;

  // Injected tokens method's stubs
  kernelStub: SinonStub;
  checkCampaignStub: SinonStub;
  s3StorageProviderStub: SinonStub;
  buildExcelStub: SinonStub;
  apdfRepositoryStub: SinonStub;

  // Constants
  START_DATE_STRING: string;
  END_DATE_STRING: string;
  START_DATE: Date;
  END_DATE: Date;

  // Tested token
  buildExcelsExportAction: ExportAction;
}

class TR extends DataRepositoryProviderInterfaceResolver {}
const test = anyTest as TestFn<Context>;

test.before((t) => {
  t.context.START_DATE = new Date('2020-01-08T00:00:00Z');
  t.context.END_DATE = new Date('2020-02-08T00:00:00Z');
  t.context.START_DATE_STRING = t.context.START_DATE.toISOString();
  t.context.END_DATE_STRING = t.context.END_DATE.toISOString();
});

test.beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.checkCampaign = new CheckCampaign(null as any);
  t.context.s3StorageProvider = new S3StorageProvider(null as any);
  t.context.buildExcel = new BuildExcel(null as any, null as any, null as any, null as any, null as any);
  t.context.config = {
    get<T>(): T {
      return true as T; // enable upload
    },
  };
  t.context.apdfRepository = new TR();
  t.context.buildExcelsExportAction = new ExportAction(
    t.context.kernel,
    t.context.checkCampaign,
    t.context.s3StorageProvider,
    t.context.apdfRepository,
    t.context.buildExcel,
    t.context.config,
  );

  t.context.kernelStub = sinon.stub(t.context.kernel, 'call');
  t.context.checkCampaignStub = sinon.stub(t.context.checkCampaign, 'call');
  t.context.s3StorageProviderStub = sinon.stub(t.context.s3StorageProvider, 'upload');
  t.context.buildExcelStub = sinon.stub(t.context.buildExcel, 'call');
  t.context.apdfRepositoryStub = sinon.stub(t.context.apdfRepository, 'getPolicyActiveOperators');
});

test.afterEach((t) => {
  t.context.checkCampaignStub!.restore();
  t.context.s3StorageProviderStub!.restore();
});

test('ExportAction: should create 1 xlsx file for last month if no date range provided, 1 campaign with 1 operator', async (t) => {
  // Arrange
  const campaign: Campaign = createGetCampaignResult('active');
  const filename = `campaign-${uuid()}.xlsx`;
  const filepath = `/tmp/exports/${filename}`;
  t.context.checkCampaignStub!.resolves(campaign);
  t.context.buildExcelStub!.resolves(filepath);
  t.context.s3StorageProviderStub!.resolves(filename);
  t.context.apdfRepositoryStub!.resolves([4]);

  // Act
  const result = await t.context.buildExcelsExportAction!.handle(
    {
      format: { tz: 'Europe/Paris' },
      query: {
        campaign_id: [campaign._id!],
      },
    },
    {
      channel: {
        service: '',
        transport: undefined,
        metadata: undefined,
      },
    },
  );

  // Assert
  const startDate = zonedTimeToUtc(startOfMonth(subMonths(new Date(), 1)), 'Europe/Paris');
  const endDate = zonedTimeToUtc(startOfMonth(new Date()), 'Europe/Paris');

  t.deepEqual(result, [filename]);
  sinon.assert.calledOnceWithMatch(t.context.checkCampaignStub!, campaign._id);
  sinon.assert.called(t.context.s3StorageProviderStub!);
  t.deepEqual(new Date(t.context.checkCampaignStub!.args[0][1]), startDate);
  t.deepEqual(new Date(t.context.checkCampaignStub!.args[0][2]), endDate);
});

test('ExportAction: should create 1 xlsx file if date range provided and 1 campaign id', async (t) => {
  // Arrange
  const campaign: Campaign = createGetCampaignResult('active');
  const filename = `campaign-${uuid()}.xlsx`;
  const filepath = `/tmp/exports/${filename}`;
  const s3_key: string = faker.system.fileName();
  t.context.checkCampaignStub!.resolves(campaign);
  t.context.buildExcelStub!.resolves({ filename, filepath });
  t.context.s3StorageProviderStub!.resolves(s3_key);
  t.context.apdfRepositoryStub!.resolves([4]);

  // Act
  const result: string[] = await t.context.buildExcelsExportAction!.handle(
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
    {
      channel: {
        service: '',
        transport: undefined,
        metadata: undefined,
      },
    },
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.checkCampaignStub,
    campaign._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );

  sinon.assert.calledOnceWithExactly(
    t.context.s3StorageProviderStub,
    BucketName.APDF,
    filepath,
    filename,
    `${campaign._id}`,
  );

  sinon.assert.calledOnceWithExactly(
    t.context.apdfRepositoryStub,
    campaign._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  t.deepEqual(result, [s3_key]);
});

test('ExportAction: should create 4 xlsx file if date range provided and 2 campaigns with 2 operators each', async (t) => {
  // Arrange
  const campaign1: Campaign = createGetCampaignResult('active');
  const campaign2: Campaign = createGetCampaignResult('active');
  const expectedFiles: string[] = [0, 1, 2, 3].map((i) => {
    const filename = `${faker.system.fileName()}.xlsx`;
    const filepath = `/tmp/exports/${filename}`;
    t.context.buildExcelStub!.onCall(i).resolves({ filename, filepath });
    t.context.s3StorageProviderStub!.onCall(i).resolves(filename);
    return filename;
  });
  t.context.checkCampaignStub!.withArgs(campaign1._id).resolves(campaign1);
  t.context.checkCampaignStub!.withArgs(campaign2._id).resolves(campaign2);
  t.context.apdfRepositoryStub!.resolves([4, 5]);

  // Act
  const result = await t.context.buildExcelsExportAction!.handle(
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
    {
      channel: {
        service: '',
        transport: undefined,
        metadata: undefined,
      },
    },
  );

  // Assert
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub!.firstCall,
    campaign1._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub!.secondCall,
    campaign2._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  t.deepEqual(result, expectedFiles);
  t.is(t.context.checkCampaignStub!.args[0][0], campaign1._id);
  t.is(t.context.checkCampaignStub!.args[1][0], campaign2._id);
});

test('ExportAction: should send error and process other if 1 export failed', async (t) => {
  // Arrange
  const campaign1: Campaign = createGetCampaignResult('active');
  const campaign2: Campaign = createGetCampaignResult('active');
  t.context.checkCampaignStub!.withArgs(campaign1._id).resolves(campaign1);
  t.context.checkCampaignStub!.withArgs(campaign2._id).resolves(campaign2);
  t.context.apdfRepositoryStub!.resolves([4, 5]);
  const filename = `${faker.system.fileName()}.xlsx`;
  const filepath = `/tmp/exports/${filename}`;
  t.context.buildExcelStub!.resolves({ filename, filepath });
  t.context.s3StorageProviderStub!.resolves(filename);
  t.context.buildExcelStub!.onCall(3).rejects(`Error`);

  // Act
  const result = await t.context.buildExcelsExportAction!.handle(
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
    {
      channel: {
        service: '',
        transport: undefined,
        metadata: undefined,
      },
    },
  );

  // Assert
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub!.firstCall,
    campaign1._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  sinon.assert.calledWithExactly(
    t.context.checkCampaignStub!.secondCall,
    campaign2._id,
    t.context.START_DATE,
    t.context.END_DATE,
  );
  t.deepEqual(
    result.sort(),
    [filename, filename, `[apdf:export] (campaign: ${campaign2.name}, operator_id: 5) Export failed`, filename].sort(),
  );
  t.is(t.context.checkCampaignStub!.args[0][0], campaign1._id);
  t.is(t.context.checkCampaignStub!.args[1][0], campaign2._id);
});
