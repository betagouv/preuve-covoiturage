import { ContextType, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import test, { serial } from 'ava';
import faker from 'faker';
import sinon, { SinonMock, SinonStub } from 'sinon';
import { ParamsInterface as GetCampaignParamInterface, ResultInterface as GetCampaignResultInterface } from '../../shared/policy/find.contract';
import { GetCampaignAndCallBuildExcel } from './GetCampaignAndCallBuildExcel';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';

const RETURNED_EXCEL_PATH: string= faker.system.directoryPath();

let getCampaignAndCallBuildExcel: GetCampaignAndCallBuildExcel;

let fakeKernelInterfaceResolver: FakeKernelInterfaceResolver;
let buildExcelFileForCampaign: BuildExcelFileForCampaign;

let kernelInterfaceResolverMock: SinonMock;
let buildExcelFileForCampaignStub: SinonStub;
let kernelInterfaceResolverStub: SinonStub<[method: string, params: GetCampaignParamInterface, context: ContextType]>;

test.before((t) => {
  fakeKernelInterfaceResolver = new FakeKernelInterfaceResolver();
  buildExcelFileForCampaign = new BuildExcelFileForCampaign(null, null);
  getCampaignAndCallBuildExcel = new GetCampaignAndCallBuildExcel(fakeKernelInterfaceResolver, buildExcelFileForCampaign)
})

test.afterEach((t) => {
  buildExcelFileForCampaignStub.restore();

  if(kernelInterfaceResolverMock){
    kernelInterfaceResolverMock.restore();
  }

  if(kernelInterfaceResolverStub) {
    kernelInterfaceResolverStub.restore();
  }
})

serial('GetCampaignAndCallBuildExcel: should create xlsx file if campaign date are in date range', async (t) => {
  // Arrange
  successStubArrange();

  const startOfMonth: Date = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setMonth(startOfMonth.getMonth() -1 );

  const endOfMonth: Date = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

  // Act 
  const excelPath: string = await getCampaignAndCallBuildExcel.call(faker.random.number(), startOfMonth, endOfMonth)

  // Assert
  t.is(excelPath, RETURNED_EXCEL_PATH);
  kernelInterfaceResolverMock.verify();
})

serial('GetCampaignAndCallBuildExcel: should create xlsx file if campaign date are in larger date range', async (t) => {
  // Arrange
  successStubArrange();

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayPlus3Years: Date = new Date();
  todayPlus3Years.setFullYear(todayPlus3Years.getFullYear() + 3)

  // Act 
  const excelPath: string = await getCampaignAndCallBuildExcel.call(faker.random.number(), todayMinus3Years, todayPlus3Years)

  // Assert
  t.is(excelPath, RETURNED_EXCEL_PATH);
  kernelInterfaceResolverMock.verify();
})

serial('GetCampaignAndCallBuildExcel: should throw NotFoundException if no campaign with id', async (t) => {
  // Arrange
  kernelInterfaceResolverStub = sinon.stub(fakeKernelInterfaceResolver, 'call');
  buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  kernelInterfaceResolverStub.rejects(new NotFoundException())
  let excelPath: string; 

  // Act 
  await t.throwsAsync(async () => {
    excelPath = await getCampaignAndCallBuildExcel.call(faker.random.number(), null, null)
  })

  // Assert
  sinon.assert.notCalled(buildExcelFileForCampaignStub);
  t.is(excelPath, undefined);
})

serial('GetCampaignAndCallBuildExcel: should throw InvalidRequestException if draft campaign', async (t) => {
  // Arrange
  kernelInterfaceResolverStub = sinon.stub(fakeKernelInterfaceResolver, 'call');
  buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  kernelInterfaceResolverStub.resolves(createGetCampaignResultInterface('draft'))
  let excelPath: string
  // Act 
  await t.throwsAsync(async () => {
    excelPath = await getCampaignAndCallBuildExcel.call(faker.random.number(), null, null)
  })
  
  // Assert
  sinon.assert.notCalled(buildExcelFileForCampaignStub);
  t.is(excelPath, undefined);
})

serial('GetCampaignAndCallBuildExcel: should throw InvalidRequestException if campaign dates are not in date range', async (t) => {
  // Arrange
  kernelInterfaceResolverStub = sinon.stub(fakeKernelInterfaceResolver, 'call');
  buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  kernelInterfaceResolverStub.resolves(createGetCampaignResultInterface('active',
    new Date(new Date().getTime() - (1 * 365 * 24 * 60 * 60 * 1000 )),
    new Date(new Date().getTime() + (1 * 365 * 24 * 60 * 60 * 1000 ))));
    let excelPath: string;

  const todayMinus3Years: Date = new Date();
  todayMinus3Years.setFullYear(todayMinus3Years.getFullYear() - 3);

  const todayMinus2Years: Date = new Date();
  todayMinus2Years.setFullYear(todayMinus2Years.getFullYear() - 2)
  
  // Act 
  await t.throwsAsync(async () => {
   excelPath = await getCampaignAndCallBuildExcel.call(faker.random.number(), todayMinus3Years, todayMinus2Years)
  })
  
  // Assert
  sinon.assert.notCalled(buildExcelFileForCampaignStub);
  t.is(excelPath, undefined);
})

const createGetCampaignResultInterface = (status: string, start_date?: Date, end_date?: Date): GetCampaignResultInterface => {
  return {
    _id: faker.random.number(),
    name: faker.random.word(),
    unit: '',
    description: faker.random.words(8),
    rules: [], 
    global_rules: [],
    territory_id: faker.random.number(),
    start_date: start_date ? start_date : faker.date.past(1),
    end_date: end_date ? end_date : faker.date.future(1),
    status: status,
    state: {
      amount: faker.random.number(),
      trip_excluded: faker.random.number(),
      trip_subsidized: faker.random.number()
    }
  }
}

const successStubArrange = () => {
kernelInterfaceResolverMock = sinon.mock(fakeKernelInterfaceResolver);
kernelInterfaceResolverMock.expects('call').once().resolves(
  createGetCampaignResultInterface('active',
new Date(new Date().getTime() - (1 * 365 * 24 * 60 * 60 * 1000 )),
new Date(new Date().getTime() + (1 * 365 * 24 * 60 * 60 * 1000 ))));

buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
buildExcelFileForCampaignStub.resolves(RETURNED_EXCEL_PATH);
}

class FakeKernelInterfaceResolver extends KernelInterfaceResolver {
  call(method: string, params: GetCampaignParamInterface, context: ContextType) {
    return null;
  }
}