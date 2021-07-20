import { ContextType, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import test, { serial } from 'ava';
import faker from 'faker';
import sinon, { SinonExpectation, SinonMock } from 'sinon';
import { ParamsInterface as GetCampaignParamInterface, ResultInterface as GetCampaignResultInterface } from '../../shared/policy/find.contract';
import { BuildExcel } from './BuildExcel';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';


let buildExcel: BuildExcel;

const RETURNED_EXCEL_PATH: string= faker.system.directoryPath();
const NOT_FOUND_CAMPAIGN_ID: number = faker.random.number();
const INACTIVE_CAMPAIGN_ID: number = faker.random.number();
const ACTIVE_CAMPAIGN_ID: number = faker.random.number();
const ACTIVE_CAMPAIGN: GetCampaignResultInterface = {
  _id: ACTIVE_CAMPAIGN_ID,
  name: '',
  unit: '',
  description: '',
  rules: [], 
  global_rules: [],
  territory_id: 856232332,
  start_date: new Date(),
  end_date: new Date(),
  status: '',
  state: {
    amount: 85,
    trip_excluded: 96,
    trip_subsidized: 89
  }
}
const INACTIVE_CAMPAIGN: GetCampaignResultInterface = {
  _id: ACTIVE_CAMPAIGN_ID,
  name: '',
  unit: '',
  description: '',
  rules: [], 
  global_rules: [],
  territory_id: 856232332,
  start_date: new Date(),
  end_date: new Date(),
  status: '',
  state: {
    amount: 85,
    trip_excluded: 96,
    trip_subsidized: 89
  }
}

class MockKernelInterfaceResolver extends KernelInterfaceResolver {
  call(method: string, params: GetCampaignParamInterface, context: ContextType) {
    switch(params._id) {
      case ACTIVE_CAMPAIGN_ID:      
        return new Promise<GetCampaignResultInterface>((resolve, reject) => {
          resolve(ACTIVE_CAMPAIGN);
        })
      case INACTIVE_CAMPAIGN_ID: 
        return new Promise<GetCampaignResultInterface>((resolve, reject) => {
          resolve(INACTIVE_CAMPAIGN);
        })
      case NOT_FOUND_CAMPAIGN_ID:
        return;
        // return new Promise<GetCampaignResultInterface>((resolve, reject) => {
        //   reject(new NotFoundException());
        // })
    }
  }
}

let mockKernelInterfaceResolver: MockKernelInterfaceResolver;
let buildExcelFileForCampaign: BuildExcelFileForCampaign;

let mockKernelInterfaceResolverStub: SinonMock;

test.beforeEach((t) => {
  mockKernelInterfaceResolver = new MockKernelInterfaceResolver();
  buildExcelFileForCampaign = new BuildExcelFileForCampaign(null, null);
  buildExcel = new BuildExcel(mockKernelInterfaceResolver, buildExcelFileForCampaign)
})

// test.afterEach((t) => {
//   mockKernelInterfaceResolverStub.restore();
// })

serial('BuildExcel: should create xlsx file', async (t) => {
  // Arrange
  mockKernelInterfaceResolverStub = sinon.mock(mockKernelInterfaceResolver);
  mockKernelInterfaceResolverStub.expects('call').once().resolves(ACTIVE_CAMPAIGN);

  const buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  buildExcelFileForCampaignStub.resolves(RETURNED_EXCEL_PATH)

  // Act 
  const excelPath: string = await buildExcel.call(ACTIVE_CAMPAIGN_ID, new Date(), new Date())

  // Assert
  t.is(excelPath, RETURNED_EXCEL_PATH)
  mockKernelInterfaceResolverStub.verify();

  mockKernelInterfaceResolverStub.restore();
  buildExcelFileForCampaignStub.restore();
})


serial('BuildExcel: should throw NotFound exception if no campaign with id', async (t) => {
  // Arrange
  const kernelInterfaceResolverStub = sinon.stub(mockKernelInterfaceResolver, 'call');
  const buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  kernelInterfaceResolverStub.rejects(new NotFoundException())
  let excelPath: string; 

  // Act 
  await t.throwsAsync(async () => {
    excelPath = await buildExcel.call(NOT_FOUND_CAMPAIGN_ID, new Date(), new Date())
  })

  // Assert
  sinon.assert.notCalled(buildExcelFileForCampaignStub)
  t.is(excelPath, undefined)
  
  buildExcelFileForCampaignStub.restore();
  kernelInterfaceResolverStub.restore();
})

test.skip('BuildExcel: should throw InvalidRequest exception if no active campaign for that date range', async (t) => {
  // Arrange
 //  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 
  const excelPath: string = await buildExcel.call(INACTIVE_CAMPAIGN_ID, null, null)

  // Assert
  t.is(excelPath, undefined)
})