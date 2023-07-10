import test from 'ava';
import sinon, { SinonStubbedInstance } from 'sinon';
import { CreateJourneyAction } from './CreateJourneyAction';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { ParseErrorException, ValidatorInterfaceResolver } from '@ilos/common';
import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';

function bootstap(): {
  action: CreateJourneyAction;
  repository: SinonStubbedInstance<AcquisitionRepositoryProvider>;
  validator: SinonStubbedInstance<ValidatorInterfaceResolver>;
} {
  const repository = sinon.createStubInstance(AcquisitionRepositoryProvider);
  const validator = sinon.createStubInstance(ValidatorInterfaceResolver);
  const action = new CreateJourneyAction(repository, validator);
  return { action, repository, validator };
}

test('should return repository data if validator not fail', async (t) => {
  const { action, repository, validator } = bootstap();
  const created_at = new Date();
  const operator_journey_id = '1';
  const repositoryResponse = [{ operator_journey_id, created_at }];
  repository.createOrUpdateMany.resolves(repositoryResponse);
  const inputData = {
    method: '',
    params: {
      operator_journey_id,
      api_version: 'v3',
      operator_trip_id: 'nope',
      operator_class: 'C',
      operator_id: 1,
    },
    context: {
      call: {
        user: { operator_id: 2, application_id: 3 },
        metadata: { req: { headers: { 'x-request-id': 'request_id' } } },
      },
      channel: {
        service: '',
      },
    },
  };
  const result = await action.call(inputData);
  t.log(result);
  t.deepEqual(result, { operator_journey_id, created_at });
  const { api_version, ...payload } = inputData.params;
  t.true(validator.validate.calledOnceWith(payload));
  t.deepEqual(repository.createOrUpdateMany.getCalls().pop().args.pop(), [
    {
      payload,
      operator_id: 2,
      operator_journey_id: '1',
      application_id: 3,
      api_version: 3,
      request_id: 'request_id',
    },
  ]);
});

test('should fail if validator fail', async (t) => {
  const { action, repository, validator } = bootstap();
  const created_at = new Date();
  const operator_journey_id = '1';
  const repositoryResponse = [{ operator_journey_id, created_at }];
  repository.createOrUpdateMany.resolves(repositoryResponse);
  const validatorError = new Error('wrong');
  validator.validate.rejects(validatorError);
  const inputData = {
    method: '',
    params: {
      operator_journey_id,
      api_version: 'v3',
      operator_trip_id: 'nope',
      operator_class: 'C',
      operator_id: 1,
    },
    context: {
      call: {
        user: { operator_id: 2, application_id: 3 },
        metadata: { req: { headers: { 'x-request-id': 'request_id' } } },
      },
      channel: {
        service: '',
      },
    },
  };
  await t.throwsAsync(async () => await action.call(inputData));
  const { api_version, ...payload } = inputData.params;
  t.true(validator.validate.calledOnceWith(payload));
  const repositoryAssertArgs = {
    payload,
    api_version: 3,
    application_id: 3,
    error_stage: AcquisitionErrorStageEnum.Acquisition,
    errors: [validatorError],
    operator_id: 2,
    operator_journey_id,
    request_id: 'request_id',
    status: AcquisitionStatusEnum.Error,
  };
  t.deepEqual(repository.createOrUpdateMany.getCalls().pop().args.pop(), [repositoryAssertArgs]);
});

test('should fail if date validation fail', async (t) => {
  const { action, repository, validator } = bootstap();
  const created_at = new Date();
  const operator_journey_id = '1';
  const repositoryResponse = [{ operator_journey_id, created_at }];
  repository.createOrUpdateMany.resolves(repositoryResponse);
  const inputData = {
    method: '',
    params: {
      api_version: 'v3',
      operator_journey_id,
      operator_trip_id: 'nope',
      operator_class: 'C',
      operator_id: 1,
      end: {
        datetime: new Date(new Date().valueOf() + 100000),
      },
    },
    context: {
      call: {
        user: { operator_id: 2, application_id: 3 },
        metadata: { req: { headers: { 'x-request-id': 'request_id' } } },
      },
      channel: {
        service: '',
      },
    },
  };
  await t.throwsAsync(async () => await action.call(inputData));
  const { api_version, ...payload } = inputData.params;
  t.true(validator.validate.calledOnceWith(payload));
  const repositoryAssertArgs = {
    payload,
    api_version: 3,
    application_id: 3,
    error_stage: AcquisitionErrorStageEnum.Acquisition,
    errors: [new ParseErrorException('Journeys cannot happen in the future')],
    operator_id: 2,
    operator_journey_id,
    request_id: 'request_id',
    status: AcquisitionStatusEnum.Error,
  };
  const repositoryArgs = repository.createOrUpdateMany.getCall(0).args[0];
  t.true(repository.createOrUpdateMany.calledOnce);
  t.deepEqual(repositoryArgs, [repositoryAssertArgs]);
});

test('should fail if journey already registred', async (t) => {
  const { action, repository, validator } = bootstap();
  const operator_journey_id = '1';
  repository.createOrUpdateMany.resolves([]);
  const inputData = {
    method: '',
    params: {
      api_version: 'v3',
      operator_journey_id,
      operator_trip_id: 'nope',
      operator_class: 'C',
      operator_id: 1,
    },
    context: {
      call: {
        user: { operator_id: 2, application_id: 3 },
        metadata: { req: { headers: { 'x-request-id': 'request_id' } } },
      },
      channel: {
        service: '',
      },
    },
  };
  await t.throwsAsync(async () => await action.call(inputData));
  const { api_version, ...payload } = inputData.params;
  t.true(validator.validate.calledOnceWith(payload));
  const repositoryAssertArgs = {
    payload,
    operator_id: 2,
    operator_journey_id,
    application_id: 3,
    api_version: 3,
    request_id: 'request_id',
  };
  const repositoryArgs = repository.createOrUpdateMany.getCall(0).args[0];
  t.true(repository.createOrUpdateMany.calledOnce);
  t.deepEqual(repositoryArgs, [repositoryAssertArgs]);
});
