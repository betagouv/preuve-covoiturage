import { ContextType, KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import {
  signature as simulateOnPastGeoSignature,
  SimulateOnPastGeoRequiredParams,
} from '@shared/policy/simulateOnPastGeo.contract';
import { ParamsInterface } from '@shared/user/simulatePolicyform.contract';
import { SimulatePolicyformAction } from './SimulatePolicyformAction';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;
  userNotificationProvider: UserNotificationProvider;

  // Injected tokens method's stubs
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;
  userNotificationProviderStub: SinonStub;

  // Tested token
  simulatePolicyformAction: SimulatePolicyformAction;

  // Constants
  SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT: any;
}

const test = anyTest as TestFn<Context>;

test.beforeEach((t) => {
  t.context.fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.userNotificationProvider = new UserNotificationProvider(null, null, null);

  t.context.simulatePolicyformAction = new SimulatePolicyformAction(
    t.context.fakeKernelInterfaceResolver,
    t.context.userNotificationProvider,
  );

  t.context.kernelInterfaceResolverStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call');
  t.context.userNotificationProviderStub = sinon.stub(t.context.userNotificationProvider, 'simulationEmail');

  t.context.SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT = {
    call: {
      user: {},
    },
    channel: {
      service: 'user',
    },
  };
});

test.afterEach((t) => {
  t.context.kernelInterfaceResolverStub!.restore();
});

test('SimulatePolicyformAction: should fail and return geo error if error in SimulateOnPastByGeoAction', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub!.throws(new Error('Could not find any coms for territory_insee 45612333333'));

  // Act
  const err = await t.throwsAsync(
    async () =>
      await t.context.simulatePolicyformAction!.handle({
        name: '',
        firstname: '',
        job: 'Developpeur',
        email: 'territory@gmail.com',
        territory_name: 'Un pays',
        simulation: {
          territory_insee: '45612333333',
          policy_template_id: '1',
        },
      }),
  );

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  t.is(err?.message, 'Could not find any coms for territory_insee 45612333333');
  t.pass();
});

test('SimulatePolicyformAction: should call simulation for 1, 3 and 6 months period', async (t) => {
  // Arrange
  const simulation: SimulateOnPastGeoRequiredParams = { territory_insee: '45612333333', policy_template_id: '1' };
  const params: ParamsInterface = {
    name: '',
    firstname: '',
    job: 'Developpeur',
    territory_name: 'Un pays',
    email: 'territory@gmail.com',
    simulation,
  };
  t.context.kernelInterfaceResolverStub!.resolves({
    amount: 1000,
    trip_subsidized: 5,
  });

  // Act
  await t.context.simulatePolicyformAction!.handle(params);

  // Assert
  sinon.assert.calledThrice(t.context.kernelInterfaceResolverStub);
  sinon.assert.calledWith(
    t.context.kernelInterfaceResolverStub.firstCall,
    simulateOnPastGeoSignature,
    { ...simulation, months: 1 },
    t.context.SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT,
  );
  sinon.assert.calledWith(
    t.context.kernelInterfaceResolverStub.secondCall,
    simulateOnPastGeoSignature,
    { ...simulation, months: 3 },
    t.context.SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT,
  );
  sinon.assert.calledWith(
    t.context.kernelInterfaceResolverStub.thirdCall,
    simulateOnPastGeoSignature,
    { ...simulation, months: 6 },
    t.context.SIMULATE_ON_PAST_BY_GEO_ACTION_CONTEXT,
  );
  sinon.assert.calledOnceWithExactly(t.context.userNotificationProviderStub, params, {
    1: { amount: 1000, trip_subsidized: 5 },
    3: { amount: 1000, trip_subsidized: 5 },
    6: { amount: 1000, trip_subsidized: 5 },
  });
  t.pass();
});
