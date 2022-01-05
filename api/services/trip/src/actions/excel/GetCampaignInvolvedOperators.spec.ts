import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResultInterface } from '../../helpers/fakeCampaign.helper.spec';
import { TripOperatorRepositoryProvider } from '../../providers/TripOperatorRepositoryProvider';
import { ResultInterface as Campaign } from '../../shared/policy/find.contract';
import { GetCampaignInvolvedOperator } from './GetCampaignInvolvedOperators';

interface Context {
  // Injected tokens
  // Injected tokens method's stubs
  tripOperatorRepositoryProviderStub: SinonStub;
  // Tested token
  getCampaignInvolvedOperator: GetCampaignInvolvedOperator;
  // Constants
}

const test = anyTest as TestFn<Partial<Context>>;

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
  const result: number[] = await t.context.getCampaignInvolvedOperator.call(campaignWithSlug, new Date(), new Date());

  // Assert
  t.deepEqual(result, whitelistOperators);
  sinon.assert.notCalled(t.context.tripOperatorRepositoryProviderStub);
});

test('GetCampaignInvolvedOperator: should fetch involved operator if no slug', async (t) => {
  // Arrange
  const campaignWithoutSlug: Campaign = createGetCampaignResultInterface('active');
  const involvedOperatord: number[] = [10, 15, 14];
  const start_date: Date = new Date();
  const end_date: Date = new Date();
  t.context.tripOperatorRepositoryProviderStub.resolves(involvedOperatord);

  // Act
  const result: number[] = await t.context.getCampaignInvolvedOperator.call(campaignWithoutSlug, start_date, end_date);

  // Assert
  t.deepEqual(result, involvedOperatord);
  sinon.assert.calledOnceWithExactly(
    t.context.tripOperatorRepositoryProviderStub,
    campaignWithoutSlug._id,
    start_date,
    end_date,
  );
});
