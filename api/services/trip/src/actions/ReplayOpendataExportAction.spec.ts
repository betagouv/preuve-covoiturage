import { KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestInterface } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { GetOldestTripDateRepositoryProvider } from '../providers/GetOldestTripRepositoryProvider';
import { ReplayOpendataExportCommand, StartEndDate } from './ReplayOpendataExportCommand';

interface Context {
  // Injected tokens
  getOldestTripDateRepositoryProvider: GetOldestTripDateRepositoryProvider;
  fakeKernelInterfaceResolver: KernelInterfaceResolver;

  // Injected tokens method's stubs
  getOldestTripDateRepositoryProviderStub: SinonStub;
  fakeKernelInterfaceResolverStub: SinonStub;

  // Constants

  // Tested token
  replayOpendataExportCommand: ReplayOpendataExportCommand;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.getOldestTripDateRepositoryProvider = new GetOldestTripDateRepositoryProvider(null);

  t.context.replayOpendataExportCommand = new ReplayOpendataExportCommand(
    t.context.getOldestTripDateRepositoryProvider,
    t.context.fakeKernelInterfaceResolver,
  );

  t.context.getOldestTripDateRepositoryProviderStub = sinon.stub(t.context.getOldestTripDateRepositoryProvider, 'call');
  t.context.fakeKernelInterfaceResolverStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call');
});

test.afterEach((t) => {
  t.context.getOldestTripDateRepositoryProviderStub.restore();
  t.context.fakeKernelInterfaceResolverStub.restore();
});

test('ReplayOpendataExportCommand: should call n times BuildExport from 08 October 2020 to Today', async (t) => {
  // Arrange
  t.context.getOldestTripDateRepositoryProviderStub.resolves(new Date('2020-10-08T15:34:52'));

  // Act
  const result: StartEndDate[] = await t.context.replayOpendataExportCommand.handle(null, null);

  // Assert
  const today: Date = new Date();
  t.deepEqual(result[0], { start: new Date('2020-10-01T00:00:00'), end: new Date('2020-10-30T23:59:59.999') });
  t.is(
    result[result.length - 1].start.toISOString().split('T')[0],
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
  );
  t.is(
    result[result.length - 1].end.toISOString().split('T')[0],
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
  );
  sinon.assert.callCount(t.context.fakeKernelInterfaceResolverStub, result.length);
});
