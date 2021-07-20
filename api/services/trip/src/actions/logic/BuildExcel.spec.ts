import { ContextType, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import test from 'ava';
import faker from 'faker';
import { ParamsInterface as GetCampaignParamInterface, ResultInterface as GetCampaignResultInterface } from '../../shared/policy/find.contract';
import { BuildExcel } from './BuildExcel';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';


let buildExcel: BuildExcel;

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
        return new Promise<GetCampaignResultInterface>((resolve, reject) => {
          reject(new NotFoundException());
        })
    }
  }
}

test.before((t) => {
  buildExcel = new BuildExcel(new MockKernelInterfaceResolver(), null)
})

test('BuildExcel: should throw NotFound exception if no campaign with id', async (t) => {
  // Arrange
  // tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 
  buildExcel.call(NOT_FOUND_CAMPAIGN_ID, null, null)

  // Assert
})

test('BuildExcel: should throw InvalidRequest exception if no active campaign for that date range', async (t) => {
  // Arrange
 //  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 
  buildExcel.call(INACTIVE_CAMPAIGN_ID, null, null)

  // Assert
})


test('BuildExcel: should create xlsx file', async (t) => {
  // Arrange
 //  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  // tripRepositoryProviderStub.throws(NotFoundException)

  // Act 
  buildExcel.call(ACTIVE_CAMPAIGN_ID, null, null)

  // Assert
})