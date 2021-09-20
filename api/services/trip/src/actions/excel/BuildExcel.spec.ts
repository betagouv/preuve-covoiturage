import anyTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { SinonStub } from 'sinon';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
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

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null);
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
  t.context.buildFilepathStub.restore();
  t.context.streamDataToWorkbookStub.restore();
  t.context.tripRepositoryProviderStub.restore();
});

test('BuildExcel: should generate excel filepath', async (t) => {
  // Arrange
  const start_date: Date = new Date();
  const end_date: Date = new Date();
  const campaign_id = 458;
  const operator_id = 4;
  const campaign_name = 'IDFM normal';
  const cursorCallback = () => {};
  const filepath = '/tmp/apdf-idfm';
  t.context.tripRepositoryProviderStub.returns(cursorCallback);
  t.context.buildFilepathStub.returns(filepath);
  t.context.streamDataToWorkbookStub.resolves(null);

  // Act
  const result: string = await t.context.buildExcel.call(campaign_id, start_date, end_date, campaign_name, operator_id);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.tripRepositoryProviderStub,
    { date: { start: start_date, end: end_date }, campaign_id: [campaign_id], operator_id: [operator_id] },
    'territory',
  );
  sinon.assert.calledOnceWithExactly(t.context.buildFilepathStub, campaign_name, operator_id);
  sinon.assert.calledOnceWithExactly(t.context.streamDataToWorkbookStub, cursorCallback, filepath);
  t.is(result, filepath);
});
