import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { BuildFilepath } from './build/BuildFilepath';
import { StreamDataToWorkBook } from './build/StreamDataToWorkbook';
import { BuildExcel } from './BuildExcel';

interface Context {
  // Injected tokens
  tripRepositoryProvider: TripRepositoryProvider;
  buildFilepath: BuildFilepath;
  streamDataToWorkbook: StreamDataToWorkBook;
  // Injected tokens method's stubs
  tripRepositoryProviderStub: SinonStub;
  buildFilepathStub: SinonStub;
  streamDataToWorkbookStub: SinonStub;
  // Tested token
  buildExcel: BuildExcel;
  // Constants
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.tripRepositoryProvider = new TripRepositoryProvider(undefined);
  t.context.buildFilepath = new BuildFilepath();
  t.context.streamDataToWorkbook = new StreamDataToWorkBook();
  t.context.buildExcel = new BuildExcel(
    t.context.tripRepositoryProvider,
    t.context.buildFilepath,
    t.context.streamDataToWorkbook,
  );
  t.context.buildFilepathStub = sinon.stub(t.context.buildFilepath, 'call');
  t.context.streamDataToWorkbookStub = sinon.stub(t.context.streamDataToWorkbook, 'call');
  t.context.tripRepositoryProviderStub = sinon.stub(t.context.tripRepositoryProvider, 'searchWithCursor');
});

test.afterEach((t) => {
  t.context.buildFilepathStub!.restore();
  t.context.streamDataToWorkbookStub!.restore();
  t.context.tripRepositoryProviderStub!.restore();
});

test('BuildExcel: should generate excel filepath', async (t) => {
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
  t.context.tripRepositoryProviderStub!.returns(cursorCallback);
  t.context.buildFilepathStub!.returns(filepath);
  t.context.streamDataToWorkbookStub!.resolves(null);

  // Act
  const result: string = await t.context.buildExcel!.call(campaign, start_date, end_date, operator_id);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.tripRepositoryProviderStub!,
    {
      date: { start: start_date, end: end_date },
      campaign_id: [campaign._id],
      operator_id: [operator_id],
    },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.buildFilepathStub!, campaign.name, operator_id, start_date);
  sinon.assert.calledOnceWithExactly(t.context.streamDataToWorkbookStub!, cursorCallback, filepath, campaign);
  t.is(result, filepath);
});
