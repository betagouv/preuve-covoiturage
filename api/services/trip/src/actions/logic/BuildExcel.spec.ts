import { InvalidRequestException } from './../../../../../ilos/common/src/exceptions/InvalidRequestException'
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
const DRAFT_CAMPAIGN_ID: number = faker.random.number();
const ACTIVE_CAMPAIGN_ID: number = faker.random.number();
const EXPIRED_CAMPAIGN_ID: number = faker.random.number();

const ACTIVE_CAMPAIGN: GetCampaignResultInterface = {
  _id: ACTIVE_CAMPAIGN_ID,
  name: faker.random.word(),
  unit: '',
  description: 'Une camapgne active',
  rules: [], 
  global_rules: [],
  territory_id: faker.random.number(),
  start_date: new Date(),
  end_date: faker.date.future(1),
  status: 'active',
  state: {
    amount: 85,
    trip_excluded: 96,
    trip_subsidized: 89
  }
}

const DRAFT_CAMPAIGN: GetCampaignResultInterface = {
  _id: DRAFT_CAMPAIGN_ID,
  name: faker.random.word(),
  unit: '',
  description: 'Une campagne encore en draft',
  rules: [], 
  global_rules: [],
  territory_id: faker.random.number(),
  start_date: new Date(),
  end_date: new Date(),
  status: 'draft',
  state: {
    amount: 85,
    trip_excluded: 96,
    trip_subsidized: 89
  }
}

const EXPIRED_CAMPAIGN: GetCampaignResultInterface = {
  _id: EXPIRED_CAMPAIGN_ID,
  name: faker.random.word(),
  unit: '',
  description: 'Une campagne qui a eu lieu dans le passé',
  rules: [], 
  global_rules: [],
  territory_id: faker.random.number(),
  start_date: faker.date.past(2),
  end_date: faker.date.past(1),
  status: 'active',
  state: {
    amount: 85,
    trip_excluded: 96,
    trip_subsidized: 89
  }
}


// TODO: remove
class MockKernelInterfaceResolver extends KernelInterfaceResolver {
  call(method: string, params: GetCampaignParamInterface, context: ContextType) {
    switch(params._id) {
      case ACTIVE_CAMPAIGN_ID:      
        return new Promise<GetCampaignResultInterface>((resolve, reject) => {
          resolve(ACTIVE_CAMPAIGN);
        })
      case DRAFT_CAMPAIGN_ID: 
        return new Promise<GetCampaignResultInterface>((resolve, reject) => {
          resolve(DRAFT_CAMPAIGN);
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


serial('BuildExcel: should throw NotFoundException if no campaign with id', async (t) => {
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

serial('BuildExcel: should throw InvalidRequestException if draft campaign', async (t) => {
  // Arrange
  const kernelInterfaceResolverStub = sinon.stub(mockKernelInterfaceResolver, 'call');
  const buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  kernelInterfaceResolverStub.resolves(DRAFT_CAMPAIGN)
  let excelPath: string
  // Act 
  await t.throwsAsync(async () => {
    excelPath = await buildExcel.call(DRAFT_CAMPAIGN_ID, null, null)
  })
  
  // Assert
  sinon.assert.notCalled(buildExcelFileForCampaignStub)
  t.is(excelPath, undefined)
  
  buildExcelFileForCampaignStub.restore();
  kernelInterfaceResolverStub.restore();
})

serial('BuildExcel: should throw InvalidRequestException if campaign is expired', async (t) => {
  // Arrange
  const kernelInterfaceResolverStub = sinon.stub(mockKernelInterfaceResolver, 'call');
  const buildExcelFileForCampaignStub = sinon.stub(buildExcelFileForCampaign, 'call');
  kernelInterfaceResolverStub.resolves(EXPIRED_CAMPAIGN)
  let excelPath: string;
  // Act 
  await t.throwsAsync(async () => {
   excelPath = await buildExcel.call(DRAFT_CAMPAIGN_ID, null, null)
  })
  
  // Assert
  sinon.assert.notCalled(buildExcelFileForCampaignStub)
  t.is(excelPath, undefined)
  
  buildExcelFileForCampaignStub.restore();
  kernelInterfaceResolverStub.restore();
})