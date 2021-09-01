import { ContextType, KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestInterface } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResultInterface } from '../helpers/fakeCampaign.helper.spec';
import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';
import { ActiveCampaignExcelExportAction } from './ActiveCampaignExcelExportAction';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;

  // Injected tokens method's stubs
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;

  // Constants
  CAMPAIGNS: CampaignInterface[];

  // Tested token
  activeCampaignExcelExportAction: ActiveCampaignExcelExportAction;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.activeCampaignExcelExportAction = new ActiveCampaignExcelExportAction(
    null,
    t.context.fakeKernelInterfaceResolver,
  );

  t.context.kernelInterfaceResolverStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call');
  t.context.CAMPAIGNS = [createGetCampaignResultInterface('active'), createGetCampaignResultInterface('active')];
});

test.afterEach((t) => {
  t.context.kernelInterfaceResolverStub.restore();
});

test('ActiveCampaignExportAction: should export 2 active campaigns and call build excel once', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.resolves(t.context.CAMPAIGNS);

  // Act
  await t.context.activeCampaignExcelExportAction.handle({}, null);

  // Assert
  sinon.assert.calledWithExactly(
    t.context.kernelInterfaceResolverStub,
    'campaign:list',
    { status: 'active' },
    { channel: { service: 'trip' }, call: { user: { permissions: ['common.policy.list'] } } },
  );
  sinon.assert.calledWithExactly(
    t.context.kernelInterfaceResolverStub,
    'trip:excelExport',
    {
      format: { tz: 'Europe/Paris' },
      query: { campaign_id: t.context.CAMPAIGNS.map((c) => c._id) },
    },
    { channel: { service: 'trip' }, call: { user: { permissions: ['registry.trip.excelExport'] } } },
  );
  t.pass();
});
