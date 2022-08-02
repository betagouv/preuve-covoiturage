import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub, SinonStubStatic } from 'sinon';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { BuildFilepath } from './BuildFilepath';
import { SlicesWorkbookWriter } from './writer/SlicesWorkbookWriter';
import { DataWorkBookWriter } from './writer/DataWorkbookWriter';
import { BuildExcel } from './BuildExcel';
import { stream } from 'exceljs';

interface Context {
  // Injected tokens
  tripRepositoryProvider: TripRepositoryProvider;
  buildFilepath: BuildFilepath;
  streamDataToWorkbook: DataWorkBookWriter;
  createSlicesSheetToWorkbook: SlicesWorkbookWriter;

  // Injected tokens method's stubs
  searchWithCursorStub: SinonStub;
  computeFundCallsSlices: SinonStub;
  buildFilepathStub: SinonStub;
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
  filepath: string;

  // Fake workbookWriter
  workbookWriterMock: any;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.createSlicesSheetToWorkbook = new SlicesWorkbookWriter();
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null);
  t.context.buildFilepath = new BuildFilepath();
  t.context.streamDataToWorkbook = new DataWorkBookWriter();
  t.context.buildExcel = new BuildExcel(
    t.context.tripRepositoryProvider,
    t.context.buildFilepath,
    t.context.streamDataToWorkbook,
    t.context.createSlicesSheetToWorkbook,
  );
  t.context.buildFilepathStub = sinon.stub(t.context.buildFilepath, 'call');
  t.context.dataWorkbookWriterStub = sinon.stub(t.context.streamDataToWorkbook, 'call');
  t.context.searchWithCursorStub = sinon.stub(t.context.tripRepositoryProvider, 'searchWithCursor');
  t.context.computeFundCallsSlices = sinon.stub(t.context.tripRepositoryProvider, 'computeFundCallsSlices');
  t.context.slicesWorkbookWriterStub = sinon.stub(t.context.createSlicesSheetToWorkbook, 'call');
});

test.before((t) => {
  t.context.campaign = {
    _id: 458,
    name: 'IDFM normal',
    state: {
      amount: 0,
      trip_subsidized: 0,
      trip_excluded: 0,
    },
    territory_id: 0,
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    unit: '',
    status: '',
    global_rules: [],
    rules: [
      [
        {
          slug: 'progressive_distance_range_meta',
          parameters: { min: 2000, max: 150000 },
        },
      ],
      [
        {
          slug: 'progressive_distance_range_meta',
          parameters: { min: 150000, max: 30000 },
        },
      ],
    ],
  };
  t.context.start_date = new Date();
  t.context.end_date = new Date();
  t.context.operator_id = 4;
  t.context.filepath = '/tmp/apdf-idfm';
  t.context.workbookWriterMock = {
    commit: () => {
      console.debug(`file is commited`);
      return;
    },
  };

  t.context.workbookWriterStub = sinon
    .stub(BuildExcel, 'initWorkbookWriter')
    .returns(t.context.workbookWriterMock as stream.xlsx.WorkbookWriter);
});

test.afterEach((t) => {
  t.context.buildFilepathStub!.restore();
  t.context.dataWorkbookWriterStub!.restore();
  t.context.searchWithCursorStub!.restore();
  t.context.slicesWorkbookWriterStub!.restore();
  t.context.workbookWriterStub!.restore();
});

test('BuildExcel: should call stream data and create slice then return excel filepath', async (t) => {
  // Arrange

  const cursorCallback = () => {};
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.buildFilepathStub!.returns(t.context.filepath);
  t.context.dataWorkbookWriterStub!.resolves();

  // Act
  const result: string = await t.context.buildExcel!.call(
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
  sinon.assert.calledOnceWithExactly(
    t.context.buildFilepathStub!,
    t.context.campaign!.name,
    t.context.operator_id,
    t.context.start_date,
  );
  sinon.assert.calledOnceWithExactly(t.context.dataWorkbookWriterStub!, cursorCallback, t.context.workbookWriterMock);
  sinon.assert.calledOnce(t.context.slicesWorkbookWriterStub!);
  sinon.assert.calledOnce(t.context.computeFundCallsSlices!);
  t.is(result, t.context.filepath!);
});

test('BuildExcel: should call stream data and return excel filepath even if create slice error occurs', async (t) => {
  // Arrange
  const cursorCallback = () => {};
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.buildFilepathStub!.returns(t.context.filepath);
  t.context.slicesWorkbookWriterStub!.rejects('Error while computing slices');

  // Act
  const result: string = await t.context.buildExcel!.call(
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
  sinon.assert.calledOnceWithExactly(
    t.context.buildFilepathStub!,
    t.context.campaign!.name,
    t.context.operator_id,
    t.context.start_date,
  );
  sinon.assert.calledOnceWithExactly(t.context.dataWorkbookWriterStub!, cursorCallback, t.context.workbookWriterMock);
  sinon.assert.calledOnce(t.context.slicesWorkbookWriterStub!);
  sinon.assert.calledOnce(t.context.computeFundCallsSlices!);
  t.is(result, t.context.filepath!);
});

test('BuildExcel: should call stream data and return excel filepath without slices', async (t) => {
  // Arrange
  t.context.campaign = {
    ...t.context.campaign!,
    rules: [],
  };
  const cursorCallback = () => {};
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.buildFilepathStub!.returns(t.context.filepath);
  t.context.slicesWorkbookWriterStub!.rejects('Error while computing slices');

  // Act
  const result: string = await t.context.buildExcel!.call(
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
  sinon.assert.calledOnceWithExactly(
    t.context.buildFilepathStub!,
    t.context.campaign!.name,
    t.context.operator_id,
    t.context.start_date,
  );
  sinon.assert.calledOnceWithExactly(t.context.dataWorkbookWriterStub!, cursorCallback, t.context.workbookWriterMock);
  sinon.assert.notCalled(t.context.slicesWorkbookWriterStub!);
  sinon.assert.notCalled(t.context.computeFundCallsSlices!);
  t.is(result, t.context.filepath!);
});
