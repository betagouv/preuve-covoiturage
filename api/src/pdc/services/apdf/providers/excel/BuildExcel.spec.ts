import { KernelInterfaceResolver } from '@ilos/common/index.ts';
import { APDFNameProvider } from '@pdc/providers/storage/index.ts';
import { PolicyStatsInterface } from '@shared/apdf/interfaces/PolicySliceStatInterface.ts';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface.ts';
import { SliceInterface } from '@shared/policy/common/interfaces/Slices.ts';
import { ResultInterface as Campaign } from '@shared/policy/find.contract.ts';
import anyTest, { TestFn } from 'ava';
import { stream } from 'exceljs';
import sinon, { SinonStub } from 'sinon';
import { CampaignSearchParamsInterface } from '../../interfaces/APDFRepositoryProviderInterface.ts';
import { DataRepositoryProvider } from '../APDFRepositoryProvider.ts';
import { BuildExcel } from './BuildExcel.ts';
import { SlicesWorksheetWriter } from './SlicesWorksheetWriter.ts';
import { TripsWorksheetWriter } from './TripsWorksheetWriter.ts';
import { wrapSlices } from './wrapSlicesHelper.ts';

interface Context {
  // Injected tokens
  kernel: KernelInterfaceResolver;
  apdfRepositoryProvider: DataRepositoryProvider;
  nameProvider: APDFNameProvider;
  streamDataToWorkbook: TripsWorksheetWriter;
  createSlicesSheetToWorkbook: SlicesWorksheetWriter;

  // Injected tokens method's stubs
  kernelStub: SinonStub;
  getPolicyCursorStub: SinonStub;
  policyStatsStub: SinonStub<
    [params: CampaignSearchParamsInterface, slices: SliceInterface[]],
    Promise<PolicyStatsInterface>
  >;
  filenameStub: SinonStub;
  filepathStub: SinonStub;
  tripsWorkbookWriterStub: SinonStub;
  slicesWorkbookWriterStub: SinonStub;
  workbookWriterStub: SinonStub;

  // Tested token
  buildExcel: BuildExcel;
  // Constants
  campaign: Campaign;
  start_date: Date;
  end_date: Date;
  operator_id: number;
  filename: string;
  filepath: string;
  booster_dates: Set<string>;

  // Fake workbookWriter
  workbookWriterMock: any;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.createSlicesSheetToWorkbook = new SlicesWorksheetWriter();
  t.context.apdfRepositoryProvider = new DataRepositoryProvider(null as any);
  t.context.nameProvider = new APDFNameProvider();
  t.context.streamDataToWorkbook = new TripsWorksheetWriter();
  t.context.buildExcel = new BuildExcel(
    t.context.kernel,
    t.context.apdfRepositoryProvider,
    t.context.streamDataToWorkbook,
    t.context.createSlicesSheetToWorkbook,
    t.context.nameProvider,
  );
  t.context.filenameStub = sinon.stub(t.context.nameProvider, 'filename');
  t.context.filepathStub = sinon.stub(t.context.nameProvider, 'filepath');
  t.context.kernelStub = sinon.stub(t.context.kernel, 'call');
  t.context.tripsWorkbookWriterStub = sinon.stub(t.context.streamDataToWorkbook, 'call');
  t.context.getPolicyCursorStub = sinon.stub(t.context.apdfRepositoryProvider, 'getPolicyCursor');
  t.context.policyStatsStub = sinon.stub(t.context.apdfRepositoryProvider, 'getPolicyStats');
  t.context.slicesWorkbookWriterStub = sinon.stub(t.context.createSlicesSheetToWorkbook, 'call');
});

test.before((t) => {
  t.context.campaign = {
    _id: 458,
    name: 'IDFM normal',
    territory_id: 0,
    description: 'description',
    start_date: new Date('2022-01-01T00:00:00Z'),
    end_date: new Date('2022-02-01T00:00:00Z'),
    handler: 'handler.js',
    status: PolicyStatusEnum.ACTIVE,
    incentive_sum: 4000,
    params: {
      slices: [
        { start: 2_000, end: 150_000 },
        { start: 15_000, end: 300_000 },
      ],
    },
  };
  t.context.start_date = new Date('2022-01-01T00:00:00Z');
  t.context.end_date = new Date('2022-02-01T00:00:00Z');
  t.context.operator_id = 4;
  t.context.filename = 'APDF-idfm.xlsx';
  t.context.filepath = '/tmp/APDF-idfm.xlsx';
  t.context.workbookWriterMock = { commit: () => {} };
  t.context.booster_dates = new Set<string>();

  t.context.workbookWriterStub = sinon
    .stub(BuildExcel, 'initWorkbookWriter')
    .returns(t.context.workbookWriterMock as stream.xlsx.WorkbookWriter);
});

test.afterEach((t) => {
  t.context.filenameStub!.restore();
  t.context.filepathStub!.restore();
  t.context.kernelStub!.restore();
  t.context.tripsWorkbookWriterStub!.restore();
  t.context.getPolicyCursorStub!.restore();
  t.context.slicesWorkbookWriterStub!.restore();
  t.context.workbookWriterStub!.restore();
});

test('BuildExcel: should call stream data and create slice then return excel filepath', async (t) => {
  // Arrange
  const cursorCallback = () => {};
  t.context.getPolicyCursorStub!.returns(cursorCallback);
  t.context.filenameStub!.returns(t.context.filename);
  t.context.filepathStub!.returns(t.context.filepath);
  t.context.tripsWorkbookWriterStub!.resolves();
  t.context.kernelStub!.resolves(t.context.booster_dates);
  t.context.policyStatsStub?.resolves({
    total_count: 111,
    total_sum: 222_00,
    subsidized_count: 111,
    slices: [
      {
        count: 1,
        sum: 2_00,
        subsidized: 1_50,
        slice: { start: 0, end: 10_000 },
      },
    ],
  });

  // Act
  const { filename, filepath } = await t.context.buildExcel!.call(
    t.context.campaign!,
    t.context.start_date!,
    t.context.end_date!,
    t.context.operator_id!,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.policyStatsStub!,
    {
      campaign_id: t.context.campaign._id,
      operator_id: t.context.operator_id,
      start_date: t.context.start_date,
      end_date: t.context.end_date,
    },
    wrapSlices(t.context.campaign.params.slices),
  );

  sinon.assert.calledOnceWithExactly(t.context.getPolicyCursorStub!, {
    campaign_id: t.context.campaign._id,
    operator_id: t.context.operator_id,
    start_date: t.context.start_date,
    end_date: t.context.end_date,
  });

  sinon.assert.calledOnceWithExactly(t.context.filenameStub!, {
    name: t.context.campaign!.name,
    campaign_id: t.context.campaign?._id,
    operator_id: t.context.operator_id,
    datetime: t.context.start_date,
    trips: 111,
    subsidized: 111,
    amount: 222_00,
  });

  sinon.assert.calledOnceWithExactly(
    t.context.tripsWorkbookWriterStub!,
    cursorCallback,
    t.context.booster_dates,
    t.context.workbookWriterMock,
  );
  sinon.assert.calledOnce(t.context.policyStatsStub!);
  sinon.assert.calledOnce(t.context.slicesWorkbookWriterStub!);
  t.is(filename, t.context.filename!);
  t.is(filepath, t.context.filepath!);
});

test('BuildExcel: should call stream data and return filepath even if create slice error occurs', async (t) => {
  // Arrange
  const cursorCallback = () => {};
  t.context.getPolicyCursorStub!.returns(cursorCallback);
  t.context.filenameStub!.returns(t.context.filename);
  t.context.filepathStub!.returns(t.context.filepath);
  t.context.slicesWorkbookWriterStub!.rejects('Error while computing slices');
  t.context.kernelStub!.resolves(t.context.booster_dates);
  t.context.policyStatsStub?.resolves({
    total_count: 111,
    total_sum: 222_00,
    subsidized_count: 111,
    slices: [
      {
        count: 1,
        sum: 2_00,
        subsidized: 1_50,
        slice: { start: 0, end: 10_000 },
      },
    ],
  });

  // Act
  const { filename, filepath } = await t.context.buildExcel!.call(
    t.context.campaign!,
    t.context.start_date!,
    t.context.end_date!,
    t.context.operator_id!,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.policyStatsStub!,
    {
      campaign_id: t.context.campaign._id,
      operator_id: t.context.operator_id,
      start_date: t.context.start_date,
      end_date: t.context.end_date,
    },
    wrapSlices(t.context.campaign.params.slices),
  );

  sinon.assert.calledOnceWithExactly(t.context.getPolicyCursorStub!, {
    campaign_id: t.context.campaign._id,
    operator_id: t.context.operator_id,
    start_date: t.context.start_date,
    end_date: t.context.end_date,
  });

  sinon.assert.calledOnceWithExactly(t.context.filenameStub!, {
    name: t.context.campaign!.name,
    campaign_id: t.context.campaign?._id,
    operator_id: t.context.operator_id,
    datetime: t.context.start_date,
    trips: 111,
    subsidized: 111,
    amount: 222_00,
  });

  sinon.assert.calledOnceWithExactly(
    t.context.tripsWorkbookWriterStub!,
    cursorCallback,
    t.context.booster_dates,
    t.context.workbookWriterMock,
  );
  sinon.assert.calledOnce(t.context.policyStatsStub!);
  sinon.assert.calledOnce(t.context.slicesWorkbookWriterStub!);
  t.is(filename, t.context.filename!);
  t.is(filepath, t.context.filepath!);
});

test('BuildExcel: should call stream data and return excel filepath without slices', async (t) => {
  // Arrange
  t.context.campaign = { ...t.context.campaign!, params: { slices: [] } };

  const cursorCallback = () => {};
  t.context.getPolicyCursorStub!.returns(cursorCallback);
  t.context.filenameStub!.returns(t.context.filename);
  t.context.filepathStub!.returns(t.context.filepath);
  t.context.slicesWorkbookWriterStub!.rejects('Error while computing slices');
  t.context.kernelStub!.resolves(t.context.booster_dates);
  t.context.policyStatsStub?.resolves({
    total_count: 111,
    total_sum: 222_00,
    subsidized_count: 111,
    slices: [],
  });

  // Act
  const { filename, filepath } = await t.context.buildExcel!.call(
    t.context.campaign!,
    t.context.start_date!,
    t.context.end_date!,
    t.context.operator_id!,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.policyStatsStub!,
    {
      campaign_id: t.context.campaign._id,
      operator_id: t.context.operator_id,
      start_date: t.context.start_date,
      end_date: t.context.end_date,
    },
    wrapSlices(t.context.campaign.params.slices),
  );

  sinon.assert.calledOnceWithExactly(t.context.getPolicyCursorStub!, {
    campaign_id: t.context.campaign._id,
    operator_id: t.context.operator_id,
    start_date: t.context.start_date,
    end_date: t.context.end_date,
  });

  sinon.assert.calledOnceWithExactly(t.context.filenameStub!, {
    name: t.context.campaign!.name,
    campaign_id: t.context.campaign?._id,
    operator_id: t.context.operator_id,
    datetime: t.context.start_date,
    trips: 111,
    subsidized: 111,
    amount: 222_00,
  });

  sinon.assert.calledOnceWithExactly(
    t.context.tripsWorkbookWriterStub!,
    cursorCallback,
    t.context.booster_dates,
    t.context.workbookWriterMock,
  );
  sinon.assert.calledOnce(t.context.policyStatsStub!);
  sinon.assert.notCalled(t.context.slicesWorkbookWriterStub!);
  t.is(filename, t.context.filename!);
  t.is(filepath, t.context.filepath!);
});
