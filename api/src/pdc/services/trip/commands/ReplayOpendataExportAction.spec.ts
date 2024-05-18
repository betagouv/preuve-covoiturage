import { KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestFn } from 'ava';
import { fromZonedTime } from 'date-fns-tz';
import sinon, { SinonStub } from 'sinon';
import { endOfMonth, startOfMonth } from '../helpers/getDefaultDates';
import { GetOldestTripDateRepositoryProvider } from '../providers/GetOldestTripRepositoryProvider';
import { ReplayOpendataExportCommand, StartEndDate } from './ReplayOpendataExportCommand';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;
  getOldestTripDateRepositoryProvider: GetOldestTripDateRepositoryProvider;

  // Injected tokens method's stubs
  fakeKernelInterfaceResolverStub: SinonStub;
  getOldestTripDateRepositoryProviderStub: SinonStub;

  // Constants

  // Tested token
  replayOpendataExportCommand: ReplayOpendataExportCommand;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.getOldestTripDateRepositoryProvider = new GetOldestTripDateRepositoryProvider(null);
  t.context.replayOpendataExportCommand = new ReplayOpendataExportCommand(
    t.context.fakeKernelInterfaceResolver,
    t.context.getOldestTripDateRepositoryProvider,
  );

  t.context.getOldestTripDateRepositoryProviderStub = sinon.stub(t.context.getOldestTripDateRepositoryProvider, 'call');
  t.context.fakeKernelInterfaceResolverStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call');
});

test.afterEach((t) => {
  t.context.fakeKernelInterfaceResolverStub.restore();
});

test('ReplayOpendataExportCommand: should call n times BuildExport from 08 October 2020 to Today', async (t) => {
  // Arrange
  t.context.getOldestTripDateRepositoryProviderStub.resolves(new Date('2020-10-08T15:34:52'));

  // Act
  const result: StartEndDate[] = await t.context.replayOpendataExportCommand.call();

  // Assert
  const today: Date = new Date();
  t.deepEqual(result[0], {
    start: fromZonedTime(new Date('2020-10-01T00:00:00'), 'Europe/Paris'),
    end: fromZonedTime(new Date('2020-10-31T23:59:59.999'), 'Europe/Paris'),
  });
  t.deepEqual(result[7], {
    start: fromZonedTime(new Date('2021-05-01T00:00:00'), 'Europe/Paris'),
    end: fromZonedTime(new Date('2021-05-31T23:59:59.999'), 'Europe/Paris'),
  });
  t.deepEqual(result[12], {
    start: fromZonedTime(new Date('2021-10-01T00:00:00'), 'Europe/Paris'),
    end: fromZonedTime(new Date('2021-10-31T23:59:59.999'), 'Europe/Paris'),
  });
  t.is(
    result[result.length - 1].start.toISOString().split('T')[0],
    startOfMonth(today, 'Europe/Paris').toISOString().split('T')[0],
  );
  t.is(result[result.length - 1].end.toISOString(), endOfMonth(today, 'Europe/Paris').toISOString());
  sinon.assert.callCount(t.context.fakeKernelInterfaceResolverStub, result.length);
});
