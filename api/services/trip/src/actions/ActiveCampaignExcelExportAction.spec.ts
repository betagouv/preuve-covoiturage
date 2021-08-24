import { ContextType } from '@ilos/common';
import test, { serial } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { FakeKernelInterfaceResolver } from '../helpers/fakeIlosClasses.helper.spec';
import { ActiveCampaignExcelExportAction } from './ActiveCampaignExcelExportAction';
import { createGetCampaignResultInterface } from './excel/GetCampaignAndCallBuildExcel.spec';

// Tested classes
let activeCampaignExcelExportAction: ActiveCampaignExcelExportAction;

// Injected tokens
let fakeKernelInterfaceResolver: FakeKernelInterfaceResolver;

// Stubs
let kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;

const CAMPAIGNS = [createGetCampaignResultInterface('active'), createGetCampaignResultInterface('active')];

test.before((t) => {
  fakeKernelInterfaceResolver = new FakeKernelInterfaceResolver();
  activeCampaignExcelExportAction = new ActiveCampaignExcelExportAction(null, fakeKernelInterfaceResolver);
});

test.beforeEach((t) => {
  kernelInterfaceResolverStub = sinon.stub(fakeKernelInterfaceResolver, 'call');
});

test.afterEach((t) => {
  kernelInterfaceResolverStub.restore();
});

serial('ActiveCampaignExportAction: should export 2 active campaigns and call build excel once', async (t) => {
  // Arrange
  kernelInterfaceResolverStub.resolves(CAMPAIGNS);

  // Act
  await activeCampaignExcelExportAction.handle({}, null);

  // Assert
  sinon.assert.calledWithExactly(
    kernelInterfaceResolverStub,
    'campaign:list',
    { status: 'active' },
    { channel: { service: 'trip' }, call: { user: { permissions: ['common.policy.list'] } } },
  );
  sinon.assert.calledWithExactly(
    kernelInterfaceResolverStub,
    'trip:excelExport',
    {
      format: { tz: 'Europe/Paris' },
      query: { campaign_id: CAMPAIGNS.map((c) => c._id) },
    },
    { channel: { service: 'trip' }, call: { user: { permissions: ['registry.trip.excelExport'] } } },
  );
  t.pass();
});
