import { faker } from '@faker-js/faker';
import { ContextType, KernelInterfaceResolver, NotFoundException } from '/ilos/common/index.ts';
import { PolicyStatusEnum } from '/shared/policy/common/interfaces/PolicyInterface.ts';
import { ResultInterface as GetCampaignResultInterface } from '/shared/policy/find.contract.ts';
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { createGetCampaignResult } from '../helpers/createGetCampaignResult.helper.ts';
import { CheckCampaign } from './CheckCampaign.ts';

interface Context {
  // Injected tokens
  kernelInterfaceResolver: KernelInterfaceResolver;

  // Injected tokens method's stubs
  kernelInterfaceResolverStub: SinonStub<[method: string, params: any, context: ContextType]>;

  // Constants
  RETURNED_EXCEL_PATH: string;
  CAMPAIGN_NAME: string;

  // Tested token
  checkCampaign: CheckCampaign;
}

const test = anyTest as TestFn<Context>;

test.beforeEach((t) => {
  t.context.kernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  t.context.checkCampaign = new CheckCampaign(t.context.kernelInterfaceResolver);

  t.context.kernelInterfaceResolverStub = sinon.stub(t.context.kernelInterfaceResolver, 'call');
  t.context.RETURNED_EXCEL_PATH = faker.system.directoryPath();
  t.context.CAMPAIGN_NAME = faker.word.noun();
});

test.afterEach((t) => {
  t.context.kernelInterfaceResolverStub.restore();
});

const successStubArrange = (ctx: Context, operator_ids: number[]): GetCampaignResultInterface => {
  const campaign: GetCampaignResultInterface = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    ctx.CAMPAIGN_NAME,
    new Date(new Date().getTime() - 1 * 365 * 24 * 60 * 60 * 1000),
    new Date(new Date().getTime() + 1 * 365 * 24 * 60 * 60 * 1000),
    operator_ids,
  );

  ctx.kernelInterfaceResolverStub.resolves(campaign);
  return campaign;
};

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should campaign be valid if provided dates are in date range and one operator', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t.context, [5]);

  const startOfMonth: Date = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  const endOfMonth: Date = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

  // Act
  await t.context.checkCampaign.call(campaign._id, startOfMonth, endOfMonth);

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  t.pass();
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should campaign be valid provided dates intersect range and 2 operators', async (t) => {
  // Arrange
  const operator_ids = [5, 6];
  const campaign: GetCampaignResultInterface = successStubArrange(t.context, operator_ids);

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus1Year: Date = new Date();
  todayPlus1Year.setFullYear(todayPlus1Year.getFullYear() + 1);

  // Act
  await t.context.checkCampaign.call(campaign._id, todayMinus3Years, todayPlus1Year);

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
  t.pass();
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should campaign be valid if dates are in larger date range and 1 operator', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t.context, [5]);

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus3Years: Date = new Date();
  todayPlus3Years.setFullYear(todayPlus3Years.getFullYear() + 3);

  // Act
  await t.context.checkCampaign.call(campaign._id, todayMinus3Years, todayPlus3Years);

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

// eslint-disable-next-line max-len
test('GetCampaignAndCallBuildExcel: should campaign be valid if dates are in larger date range and no operator whitelist', async (t) => {
  // Arrange
  const campaign: GetCampaignResultInterface = successStubArrange(t.context, []);

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus3Years: Date = new Date();
  todayPlus3Years.setFullYear(todayPlus3Years.getFullYear() + 3);

  // Act
  await t.context.checkCampaign.call(campaign._id, todayMinus3Years, todayPlus3Years);

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('GetCampaignAndCallBuildExcel: should throw NotFoundException if no campaign with id', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.rejects(new NotFoundException());

  // Act
  await t.throwsAsync(async () => {
    await t.context.checkCampaign.call(faker.number.int(), new Date(), new Date());
  });

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('GetCampaignAndCallBuildExcel: should throw Error if draft campaign', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.resolves(
    createGetCampaignResult(PolicyStatusEnum.DRAFT, t.context.CAMPAIGN_NAME),
  );

  // Act
  await t.throwsAsync(async () => {
    await t.context.checkCampaign.call(faker.number.int(), new Date(), new Date());
  });

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('GetCampaignAndCallBuildExcel: should throw Error if campaign dates are not in date range', async (t) => {
  // Arrange
  t.context.kernelInterfaceResolverStub.resolves(
    createGetCampaignResult(
      PolicyStatusEnum.ACTIVE,
      t.context.CAMPAIGN_NAME,
      new Date(new Date().getTime() - 1 * 365 * 24 * 60 * 60 * 1000),
      new Date(new Date().getTime() + 1 * 365 * 24 * 60 * 60 * 1000),
    ),
  );

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayMinus2Years: Date = new Date();
  todayMinus2Years.setFullYear(todayMinus2Years.getFullYear() - 2);

  // Act
  await t.throwsAsync(async () => {
    await t.context.checkCampaign.call(faker.number.int(), todayMinus3Years, todayMinus2Years);
  });

  // Assert
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower = start. end = upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower = start. end < upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2022-02-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower < start. end = upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2022-02-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower > start. end < upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2021-12-01T00:00:00+0100'),
    new Date('2022-02-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower < start. end > upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2022-12-01T00:00:00+0100'),
    new Date('2023-02-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower < start. end < upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2022-12-01T00:00:00+0100'),
    new Date('2023-02-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});

test('isValidDateRange: lower > start. end > upper', async (t) => {
  // Arrange
  const campaign = createGetCampaignResult(
    PolicyStatusEnum.ACTIVE,
    t.context.CAMPAIGN_NAME,
    new Date('2022-01-01T00:00:00+0100'),
    new Date('2023-01-01T00:00:00+0100'),
  );
  t.context.kernelInterfaceResolverStub.resolves(campaign);

  // Act
  await t.context.checkCampaign.call(
    campaign._id,
    new Date('2021-12-01T00:00:00+0100'),
    new Date('2023-02-01T00:00:00+0100'),
  );

  // Assert
  t.pass();
  sinon.assert.calledOnce(t.context.kernelInterfaceResolverStub);
});
