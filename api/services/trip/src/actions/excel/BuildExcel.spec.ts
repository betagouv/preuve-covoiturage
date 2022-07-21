import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { BuildFilepath } from './build/BuildFilepath';
import { CreateSlicesSheetToWorkbook } from './build/CreateSlicesSheetToWorkbook';
import { StreamDataToWorkBook } from './build/StreamDataToWorkbook';
import { BuildExcel } from './BuildExcel';

interface Context {
  // Injected tokens
  tripRepositoryProvider: TripRepositoryProvider;
  buildFilepath: BuildFilepath;
  streamDataToWorkbook: StreamDataToWorkBook;
  createSlicesSheetToWorkbook: CreateSlicesSheetToWorkbook;

  // Injected tokens method's stubs
  searchWithCursorStub: SinonStub;
  computeFundCallsSlices: SinonStub;
  buildFilepathStub: SinonStub;
  streamDataToWorkbookStub: SinonStub;
  createSlicesSheetToWorkbookStub: SinonStub;

  // Tested token
  buildExcel: BuildExcel;
  // Constants
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.createSlicesSheetToWorkbook = new CreateSlicesSheetToWorkbook();
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null);
  t.context.buildFilepath = new BuildFilepath();
  t.context.streamDataToWorkbook = new StreamDataToWorkBook();
  t.context.buildExcel = new BuildExcel(
    t.context.tripRepositoryProvider,
    t.context.buildFilepath,
    t.context.streamDataToWorkbook,
    t.context.createSlicesSheetToWorkbook,
  );
  t.context.buildFilepathStub = sinon.stub(t.context.buildFilepath, 'call');
  t.context.streamDataToWorkbookStub = sinon.stub(t.context.streamDataToWorkbook, 'call');
  t.context.searchWithCursorStub = sinon.stub(t.context.tripRepositoryProvider, 'searchWithCursor');
  t.context.computeFundCallsSlices = sinon.stub(t.context.tripRepositoryProvider, 'computeFundCallsSlices');
  t.context.createSlicesSheetToWorkbookStub = sinon.stub(t.context.createSlicesSheetToWorkbook, 'call');
});

test.afterEach((t) => {
  t.context.buildFilepathStub!.restore();
  t.context.streamDataToWorkbookStub!.restore();
  t.context.searchWithCursorStub!.restore();
  t.context.createSlicesSheetToWorkbookStub!.restore();
});

test('BuildExcel: should call stream data and create slice then return excel filepath', async (t) => {
  // Arrange
  const start_date: Date = new Date();
  const end_date: Date = new Date();
  const campaign: Campaign = {
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
    rules: [],
  };
  const operator_id = 4;
  const cursorCallback = () => {};
  const filepath = '/tmp/apdf-idfm';
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.buildFilepathStub!.returns(filepath);
  t.context.streamDataToWorkbookStub!.resolves();
  t.context.createSlicesSheetToWorkbookStub!.resolves();

  // Act
  const result: string = await t.context.buildExcel!.call(campaign, start_date, end_date, operator_id);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.searchWithCursorStub!,
    {
      date: { start: start_date, end: end_date },
      campaign_id: [campaign._id],
      operator_id: [operator_id],
    },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.buildFilepathStub!, campaign.name, operator_id, start_date);
  sinon.assert.calledOnceWithExactly(t.context.streamDataToWorkbookStub!, cursorCallback, filepath, campaign);
  sinon.assert.calledOnce(t.context.createSlicesSheetToWorkbookStub!);
  sinon.assert.calledOnce(t.context.computeFundCallsSlices!);
  t.is(result, filepath);
});

test('BuildExcel: should call stream data and return excel filepath even if create slice error occurs', async (t) => {
  // Arrange
  const start_date: Date = new Date();
  const end_date: Date = new Date();
  const campaign: Campaign = {
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
    rules: [],
  };
  const operator_id = 4;
  const cursorCallback = () => {};
  const filepath = '/tmp/apdf-idfm';
  t.context.searchWithCursorStub!.returns(cursorCallback);
  t.context.buildFilepathStub!.returns(filepath);
  t.context.createSlicesSheetToWorkbookStub!.rejects('Error while computing slices');

  // Act
  const result: string = await t.context.buildExcel!.call(campaign, start_date, end_date, operator_id);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.searchWithCursorStub!,
    {
      date: { start: start_date, end: end_date },
      campaign_id: [campaign._id],
      operator_id: [operator_id],
    },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.buildFilepathStub!, campaign.name, operator_id, start_date);
  sinon.assert.calledOnceWithExactly(t.context.streamDataToWorkbookStub!, cursorCallback, filepath, campaign);
  sinon.assert.calledOnce(t.context.createSlicesSheetToWorkbookStub!);
  sinon.assert.calledOnce(t.context.computeFundCallsSlices!);
  t.is(result, filepath);
});
