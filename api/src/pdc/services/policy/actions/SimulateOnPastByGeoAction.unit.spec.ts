import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { ContextType, KernelInterfaceResolver } from '@/ilos/common/index.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { SimulateOnPastByGeoAction } from './SimulateOnPastByGeoAction.ts';
import { CarpoolInterface, PolicyInterface, TripRepositoryProviderInterfaceResolver } from '../interfaces/index.ts';
import { ResultInterface } from '@/shared/policy/simulateOnPastGeo.contract.ts';
import { faker } from '@/deps.ts';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;
  tripRepository: TripRepositoryProviderInterfaceResolver;

  // Injected tokens method's stubs
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;
  tripRepositoryResolverStub: SinonStub;

  // Tested token
  simulateOnPasGeoAction: SimulateOnPastByGeoAction;

  // Constants
  todayMinusSizMonthes: Date;
}

const test = anyTest as TestFn<Context>;

class FakeTripRepositoryProvider extends TripRepositoryProviderInterfaceResolver {
  findTripByPolicy(
    policy: PolicyInterface,
    from: Date,
    to: Date,
    batchSize?: number | undefined,
    override?: boolean | undefined,
  ): AsyncGenerator<CarpoolInterface[], void, void> {
    throw new Error('Method not implemented.');
  }
  findTripByGeo(
    coms: string[],
    from: Date,
    to: Date,
    batchSize?: number | undefined,
    override?: boolean | undefined,
  ): AsyncGenerator<CarpoolInterface[], void, void> {
    throw new Error('Method not implemented.');
  }
}

beforeEach((t) => {
  t.context.fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.tripRepository = new FakeTripRepositoryProvider();
  t.context.simulateOnPasGeoAction = new SimulateOnPastByGeoAction(
    t.context.fakeKernelInterfaceResolver,
    t.context.tripRepository,
  );

  t.context.kernelInterfaceResolverStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call') as any;
  t.context.tripRepositoryResolverStub = sinon.stub(t.context.tripRepository, 'findTripByGeo');

  t.context.todayMinusSizMonthes = new Date();
  t.context.todayMinusSizMonthes.setMonth(t.context.todayMinusSizMonthes.getMonth() - 6);
});

afterEach((t) => {
  t.context.kernelInterfaceResolverStub!.restore();
});

it('SimulateOnPastByGeoAction: should fails if geo not found', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub!.resolves({ coms: [] });

  // Act
  const err = await assertThrows(
    async () =>
      await t.context.simulateOnPasGeoAction!.handle({
        territory_insee: '45612333333',
        policy_template_id: '1',
      }),
  );

  // Assert
  assertEquals(err?.message, 'Could not find any coms for territory_insee 45612333333');
  sinon.assert.notCalled(t.context.tripRepositoryResolverStub!);
});

it('SimulateOnPastByGeoAction: should process trip with default time frame', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub!.resolves({
    aom_siren: '200041630',
    epci_siren: '200041630',
    coms: ['08199', '08137', '08179', '08199'],
  });
  t.context.tripRepositoryResolverStub!.callsFake(function* fake() {
    const carpool: Partial<CarpoolInterface> = {
      operator_trip_id: '',
      operator_class: 'C',
      datetime: faker.date.between({ from: t.context.todayMinusSizMonthes, to: new Date() }),
      seats: 1,
      distance: 25000,
      start: { com: '08199', aom: '200041630', epci: '200041630', reg: '44' },
      end: { com: '08199', aom: '200041630', epci: '200041630', reg: '44' },
    };
    const carpools: Partial<CarpoolInterface>[] = [carpool, carpool, carpool, carpool];
    yield carpools;
  });

  // Act
  const result: ResultInterface = await t.context.simulateOnPasGeoAction!.handle({
    territory_insee: '200041630',
    policy_template_id: '1',
  });

  // Assert
  assertEquals(result.amount, 1000);
  assertEquals(result.trip_subsidized, 4);
});

it('SimulateOnPastByGeoAction: should exclude trip with start and end not in 200070340 epci perimeter', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub!.resolves({
    aom_siren: '84',
    reg_siren: '84',
    epci_siren: '200070340',
    coms: ['73040', '73290', '73117', '73223', '73023', '73322', '73157', '73026', '73119', '73047'],
  });
  t.context.tripRepositoryResolverStub!.callsFake(function* fake() {
    const carpool: Partial<CarpoolInterface> = {
      operator_trip_id: '',
      operator_class: 'C',
      datetime: faker.date.between({ from: t.context.todayMinusSizMonthes, to: new Date() }),
      seats: 1,
      distance: 25000,
      start: { com: '73290', aom: '84', epci: '200070340', reg: '84' },
      end: { com: '73194', aom: '84', epci: '247300452', reg: '84' },
    };
    const carpools: Partial<CarpoolInterface>[] = [carpool, carpool, carpool, carpool];
    yield carpools;
  });

  // Act
  const result: ResultInterface = await t.context.simulateOnPasGeoAction!.handle({
    territory_insee: '200070340',
    policy_template_id: '2',
  });

  // Assert
  assertEquals(result.amount, 0);
  assertEquals(result.trip_subsidized, 0);
});
