import { ContextType, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import anyTest, { TestInterface } from 'ava';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResultInterface } from '../../helpers/fakeCampaign.helper.spec';
import { ResultInterface as GetCampaignResultInterface } from '../../shared/policy/find.contract';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';
import { GetCampaignAndCallBuildExcel } from './GetCampaignAndCallBuildExcel';

interface Context {
  // Injected tokens
  kernelInterfaceResolver: KernelInterfaceResolver;
  buildExcelFileForCampaign: BuildExcelFileForCampaign;

  // Injected tokens method's stubs
  buildExcelFileForCampaignStub: SinonStub;
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;

  // Constants
  RETURNED_EXCEL_PATH: string;
  CAMPAIGN_NAME: string;

  // Tested token
  getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.kernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.buildExcelFileForCampaign = new BuildExcelFileForCampaign(null, null);
  t.context.getCampaignAndCallBuildExcel = new GetCampaignAndCallBuildExcel(
    t.context.kernelInterfaceResolver,
    t.context.buildExcelFileForCampaign,
  );

  t.context.kernelInterfaceResolverStub = sinon.stub(t.context.kernelInterfaceResolver, 'call');
  t.context.buildExcelFileForCampaignStub = sinon.stub(t.context.buildExcelFileForCampaign, 'call');
  t.context.RETURNED_EXCEL_PATH = faker.system.directoryPath();
  t.context.CAMPAIGN_NAME = faker.random.word();
});

test.afterEach((t) => {
  t.context.buildExcelFileForCampaignStub.restore();
  t.context.kernelInterfaceResolverStub.restore();
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should create xlsx file if campaign date are in date range and one operator', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t, [5]);

  const startOfMonth: Date = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  const endOfMonth: Date = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

  // Act
  const excelPath: string[] = await t.context.getCampaignAndCallBuildExcel.call(campaign._id, startOfMonth, endOfMonth);

  // Assert
  t.is(excelPath[0], t.context.RETURNED_EXCEL_PATH);
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.calledOnceWithExactly(
    t.context.buildExcelFileForCampaignStub,
    campaign._id,
    startOfMonth,
    endOfMonth,
    t.context.CAMPAIGN_NAME,
    5,
  );
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should create xlsx file if campaign date intersect range and 2 operators', async (t) => {
  // Arrange
  const operator_ids = [5, 6];
  const campaign: GetCampaignResultInterface = successStubArrange(t, operator_ids);

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus1Year: Date = new Date();
  todayPlus1Year.setFullYear(todayPlus1Year.getFullYear() + 1);

  // Act
  const excelPath: string[] = await t.context.getCampaignAndCallBuildExcel.call(
    campaign._id,
    todayMinus3Years,
    todayPlus1Year,
  );

  // Assert
  t.is(excelPath[0], t.context.RETURNED_EXCEL_PATH);
  t.is(excelPath[1], t.context.RETURNED_EXCEL_PATH);
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.calledWithExactly(
    t.context.buildExcelFileForCampaignStub.firstCall,
    campaign._id,
    todayMinus3Years,
    todayPlus1Year,
    t.context.CAMPAIGN_NAME,
    5,
  );
  sinon.assert.calledWithExactly(
    t.context.buildExcelFileForCampaignStub.secondCall,
    campaign._id,
    todayMinus3Years,
    todayPlus1Year,
    t.context.CAMPAIGN_NAME,
    6,
  );
});

test('GetCampaignAndCallBuildExcel: should create xlsx file for last month if no date provided provided', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t, [5]);

  // Act
  const excelPath: string[] = await t.context.getCampaignAndCallBuildExcel.call(campaign._id);

  // Assert
  t.is(excelPath[0], t.context.RETURNED_EXCEL_PATH);
  sinon.assert.calledOnce(t.context.buildExcelFileForCampaignStub);
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should create xlsx file if campaign date are in larger date range and 1 operator', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t, [5]);

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus3Years: Date = new Date();
  todayPlus3Years.setFullYear(todayPlus3Years.getFullYear() + 3);

  // Act
  const excelPath: string[] = await t.context.getCampaignAndCallBuildExcel.call(
    campaign._id,
    todayMinus3Years,
    todayPlus3Years,
  );

  // Assert
  t.is(excelPath[0], t.context.RETURNED_EXCEL_PATH);
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.calledOnceWithExactly(
    t.context.buildExcelFileForCampaignStub,
    campaign._id,
    todayMinus3Years,
    todayPlus3Years,
    t.context.CAMPAIGN_NAME,
    5,
  );
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should create 1 xlsx file if campaign date are in larger date range and no operator whitelist', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t, null);

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus3Years: Date = new Date();
  todayPlus3Years.setFullYear(todayPlus3Years.getFullYear() + 3);

  // Act
  const excelPath: string[] = await t.context.getCampaignAndCallBuildExcel.call(
    campaign._id,
    todayMinus3Years,
    todayPlus3Years,
  );

  // Assert
  t.is(excelPath[0], t.context.RETURNED_EXCEL_PATH);
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.calledOnceWithExactly(
    t.context.buildExcelFileForCampaignStub,
    campaign._id,
    todayMinus3Years,
    todayPlus3Years,
    t.context.CAMPAIGN_NAME,
  );
});

test('GetCampaignAndCallBuildExcel: should throw NotFoundException if no campaign with id', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.rejects(new NotFoundException());
  let excelPath: string[];

  // Act
  await t.throwsAsync(async () => {
    excelPath = await t.context.getCampaignAndCallBuildExcel.call(faker.random.number(), null, null);
  });

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.notCalled(t.context.buildExcelFileForCampaignStub);
  t.is(excelPath, undefined);
});

test('GetCampaignAndCallBuildExcel: should throw InvalidRequestException if draft campaign', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.resolves(createGetCampaignResultInterface('draft', t.context.CAMPAIGN_NAME));
  let excelPath: string[];

  // Act
  await t.throwsAsync(async () => {
    excelPath = await t.context.getCampaignAndCallBuildExcel.call(faker.random.number(), null, null);
  });

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.notCalled(t.context.buildExcelFileForCampaignStub);
  t.is(excelPath, undefined);
});

test('GetCampaignAndCallBuildExcel: should throw InvalidRequest if campaign dates are not in date range', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.resolves(
    createGetCampaignResultInterface(
      'active',
      t.context.CAMPAIGN_NAME,
      new Date(new Date().getTime() - 1 * 365 * 24 * 60 * 60 * 1000),
      new Date(new Date().getTime() + 1 * 365 * 24 * 60 * 60 * 1000),
    ),
  );
  let excelPath: string[];

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayMinus2Years: Date = new Date();
  todayMinus2Years.setFullYear(todayMinus2Years.getFullYear() - 2);

  // Act
  await t.throwsAsync(async () => {
    excelPath = await t.context.getCampaignAndCallBuildExcel.call(
      faker.random.number(),
      todayMinus3Years,
      todayMinus2Years,
    );
  });

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  sinon.assert.notCalled(t.context.buildExcelFileForCampaignStub);
  t.is(excelPath, undefined);
});

const successStubArrange = (t, operator_ids: number[]): GetCampaignResultInterface => {
  const campaign: GetCampaignResultInterface = createGetCampaignResultInterface(
    'active',
    t.context.CAMPAIGN_NAME,
    new Date(new Date().getTime() - 1 * 365 * 24 * 60 * 60 * 1000),
    new Date(new Date().getTime() + 1 * 365 * 24 * 60 * 60 * 1000),
    operator_ids,
  );

  t.context.kernelInterfaceResolverStub.resolves(campaign);
  t.context.buildExcelFileForCampaignStub.resolves(t.context.RETURNED_EXCEL_PATH);
  return campaign;
};
