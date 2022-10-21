import { APDFNameProvider } from '@pdc/provider-file';
import anyTest, { TestFn } from 'ava';
import { stream } from 'exceljs';
import sinon, { SinonStub } from 'sinon';
import { CampaignSearchParamsInterface } from '../../interfaces';
import { PolicyStatsInterface } from '../../interfaces/PolicySliceStatInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { SliceInterface } from '../../shared/policy/common/interfaces/SliceInterface';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { BuildExcel } from './BuildExcel';
import { DataWorkBookWriter } from './writer/DataWorkbookWriter';
import { SlicesWorkbookWriter } from './writer/SlicesWorkbookWriter';

interface Context {
  // Injected tokens
  tripRepositoryProvider: TripRepositoryProvider;
  nameProvider: APDFNameProvider;
  streamDataToWorkbook: DataWorkBookWriter;
  createSlicesSheetToWorkbook: SlicesWorkbookWriter;

  // Injected tokens method's stubs
  searchWithCursorStub: SinonStub;
  policyStatsStub: SinonStub<
    [params: CampaignSearchParamsInterface, slices: SliceInterface[]],
    Promise<PolicyStatsInterface>
  >;
  filenameStub: SinonStub;
  filepathStub: SinonStub;
  dataWorkbookWriterStub: SinonStub;
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

  // Fake workbookWriter
  workbookWriterMock: any;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.createSlicesSheetToWorkbook = new SlicesWorkbookWriter();
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null as any);
  t.context.nameProvider = new APDFNameProvider();
  t.context.streamDataToWorkbook = new DataWorkBookWriter();
  t.context.buildExcel = new BuildExcel(
    t.context.tripRepositoryProvider,
    t.context.streamDataToWorkbook,
    t.context.createSlicesSheetToWorkbook,
    t.context.nameProvider,
  );
  t.context.filenameStub = sinon.stub(t.context.nameProvider, 'filename');
  t.context.filepathStub = sinon.stub(t.context.nameProvider, 'filepath');
  t.context.dataWorkbookWriterStub = sinon.stub(t.context.streamDataToWorkbook, 'call');
  t.context.searchWithCursorStub = sinon.stub(t.context.tripRepositoryProvider, 'searchWithCursor');
  t.context.policyStatsStub = sinon.stub(t.context.tripRepositoryProvider, 'getPolicyStats');
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
    status: 'active',
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
  t.context.workbookWriterMock = {
    commit: () => {
      return;
    },
  };

  t.context.workbookWriterStub = sinon
    .stub(BuildExcel, 'initWorkbookWriter')
    .returns(t.context.workbookWriterMock as stream.xlsx.WorkbookWriter);
});

test.afterEach((t) => {
  t.context.filenameStub!.restore();
  t.context.filepathStub!.restore();
  t.context.dataWorkbookWriterStub!.restore();
  t.context.searchWithCursorStub!.restore();
  t.context.slicesWorkbookWriterStub!.restore();
  t.context.workbookWriterStub!.restore();
});

test('BuildExcel: should call stream data and create slice then return excel filepath', async (t) => {
  // Arrange

  const cursorCallback = () => {};
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.filenameStub!.returns(t.context.filename);
  t.context.filepathStub!.returns(t.context.filepath);
  t.context.dataWorkbookWriterStub!.resolves();
  t.context.policyStatsStub?.resolves({
    count: 111,
    sum: 222_00,
    slices: [
      {
        count: 1,
        sum: 2_00,
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
    t.context.searchWithCursorStub!,
    {
      date: { start: t.context.start_date, end: t.context.end_date },
      campaign_id: [t.context.campaign!._id],
      operator_id: [t.context.operator_id],
    },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.filenameStub!, {
    name: t.context.campaign!.name,
    campaign_id: t.context.campaign?._id,
    operator_id: t.context.operator_id,
    datetime: t.context.start_date,
    trips: 111,
    amount: 222_00,
  });
  sinon.assert.calledOnceWithExactly(t.context.dataWorkbookWriterStub!, cursorCallback, t.context.workbookWriterMock);
  sinon.assert.calledOnce(t.context.policyStatsStub!);
  sinon.assert.calledOnce(t.context.slicesWorkbookWriterStub!);
  t.is(filename, t.context.filename!);
  t.is(filepath, t.context.filepath!);
});

test('BuildExcel: should call stream data and return filepath even if create slice error occurs', async (t) => {
  // Arrange
  const cursorCallback = () => {};
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.filenameStub!.returns(t.context.filename);
  t.context.filepathStub!.returns(t.context.filepath);
  t.context.slicesWorkbookWriterStub!.rejects('Error while computing slices');
  t.context.policyStatsStub?.resolves({
    count: 111,
    sum: 222_00,
    slices: [
      {
        count: 1,
        sum: 2_00,
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
    t.context.searchWithCursorStub!,
    {
      date: { start: t.context.start_date, end: t.context.end_date },
      campaign_id: [t.context.campaign!._id],
      operator_id: [t.context.operator_id],
    },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.filenameStub!, {
    name: t.context.campaign!.name,
    campaign_id: t.context.campaign?._id,
    operator_id: t.context.operator_id,
    datetime: t.context.start_date,
    trips: 111,
    amount: 222_00,
  });
  sinon.assert.calledOnceWithExactly(t.context.dataWorkbookWriterStub!, cursorCallback, t.context.workbookWriterMock);
  sinon.assert.calledOnce(t.context.policyStatsStub!);
  sinon.assert.calledOnce(t.context.slicesWorkbookWriterStub!);
  t.is(filename, t.context.filename!);
  t.is(filepath, t.context.filepath!);
});

test('BuildExcel: should call stream data and return excel filepath without slices', async (t) => {
  // Arrange
  t.context.campaign = {
    ...t.context.campaign!,
    params: {},
  };
  const cursorCallback = () => {};
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.filenameStub!.returns(t.context.filename);
  t.context.filepathStub!.returns(t.context.filepath);
  t.context.slicesWorkbookWriterStub!.rejects('Error while computing slices');
  t.context.policyStatsStub?.resolves({
    count: 111,
    sum: 222_00,
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
    t.context.searchWithCursorStub!,
    {
      date: { start: t.context.start_date, end: t.context.end_date },
      campaign_id: [t.context.campaign!._id],
      operator_id: [t.context.operator_id],
    },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.filenameStub!, {
    name: t.context.campaign!.name,
    campaign_id: t.context.campaign?._id,
    operator_id: t.context.operator_id,
    datetime: t.context.start_date,
    trips: 111,
    amount: 222_00,
  });
  sinon.assert.calledOnceWithExactly(t.context.dataWorkbookWriterStub!, cursorCallback, t.context.workbookWriterMock);
  sinon.assert.calledOnce(t.context.policyStatsStub!);
  sinon.assert.notCalled(t.context.slicesWorkbookWriterStub!);
  t.is(filename, t.context.filename!);
  t.is(filepath, t.context.filepath!);
});
