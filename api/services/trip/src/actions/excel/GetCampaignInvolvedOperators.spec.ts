import anyTest, { TestInterface } from 'ava';
import { GetCampaignInvolvedOperator } from './GetCampaignInvolvedOperators';
import {
  ParamsInterface as GetCampaignParamInterface,
  ResultInterface as Campaign,
  signature as getCampaignSignature,
} from '../../shared/policy/find.contract';
import { createGetCampaignResultInterface } from '../../helpers/fakeCampaign.helper.spec';
import { SinonStub } from 'sinon';
import { TripOperatorRepositoryProvider } from '../../providers/TripOperatorRepositoryProvider';
import sinon from 'sinon';

interface Context {
  // Injected tokens
  // tripOperatorRepositoryProvider: TripOperatorRepositoryProvider;
  // Injected tokens method's stubs
  tripOperatorRepositoryProviderStub: SinonStub;
  // Tested token
  getCampaignInvolvedOperator: GetCampaignInvolvedOperator;
  // Constants
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  const tripOperatorRepositoryProvider: TripOperatorRepositoryProvider = new TripOperatorRepositoryProvider(null);
  t.context.getCampaignInvolvedOperator = new GetCampaignInvolvedOperator(tripOperatorRepositoryProvider);
  t.context.tripOperatorRepositoryProviderStub = sinon.stub(tripOperatorRepositoryProvider, 'getInvoledOperators');
});

test.afterEach((t) => {});

test('GetCampaignInvolvedOperator: should get slug if present', async (t) => {
  // Arrange
  const whitelistOperators: number[] = [8, 5, 4];
  const campaignWithSlug: Campaign = createGetCampaignResultInterface('active', null, null, null, whitelistOperators);

  // Act
  const result: number[] = await t.context.getCampaignInvolvedOperator.call(campaignWithSlug);

  // Assert
  t.deepEqual(result, whitelistOperators);
  sinon.assert.notCalled(t.context.tripOperatorRepositoryProviderStub);
});

test('GetCampaignInvolvedOperator: should fetch involved operator if no slug', async (t) => {
  // Arrange
  const campaignWithoutSlug: Campaign = createGetCampaignResultInterface('active');
  const involvedOperatord: number[] = [10, 15, 14];
  t.context.tripOperatorRepositoryProviderStub.resolves(involvedOperatord);

  // Act
  const result: number[] = await t.context.getCampaignInvolvedOperator.call(campaignWithoutSlug);

  // Assert
  t.deepEqual(result, involvedOperatord);
  sinon.assert.calledOnceWithExactly(t.context.tripOperatorRepositoryProviderStub, campaignWithoutSlug._id);
});
