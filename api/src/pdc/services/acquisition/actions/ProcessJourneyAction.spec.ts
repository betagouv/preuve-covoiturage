import test from 'ava';
import sinon, { SinonStubbedInstance } from 'sinon';
import { ProcessJourneyAction } from './ProcessJourneyAction';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { KernelInterfaceResolver } from '@ilos/common';
import { NormalizationProvider } from '@pdc/providers/normalization';
import { ConfigStore } from '@ilos/core/extensions';

import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';
import { signature } from '@shared/carpool/crosscheck.contract';
import { callContext } from '../config/callContext';

function bootstrap(): {
  action: ProcessJourneyAction;
  repository: SinonStubbedInstance<AcquisitionRepositoryProvider>;
  kernel: SinonStubbedInstance<KernelInterfaceResolver>;
  normalizer: SinonStubbedInstance<NormalizationProvider>;
} {
  const repository = sinon.createStubInstance(AcquisitionRepositoryProvider);
  const kernel = sinon.createStubInstance(KernelInterfaceResolver);
  const normalizer = sinon.createStubInstance(NormalizationProvider);
  const action = new ProcessJourneyAction(
    repository,
    normalizer,
    kernel,
    new ConfigStore({
      processing: {
        batchSize: 10,
        timeout: 10000,
      },
    }),
  );
  return { action, repository, kernel, normalizer };
}

test.afterEach((t) => {
  // @ts-expect-error
  if (ProcessJourneyAction.killSwitch.isSinonProxy) {
    // @ts-expect-error
    ProcessJourneyAction.killSwitch.restore();
  }
});

test('should process if normalization ok', async (t) => {
  const { action, repository, normalizer, kernel } = bootstrap();
  const normalizedPayload = { normalized: 'data' } as any;
  normalizer.handle.resolves(normalizedPayload);
  const updateCallbackStub = sinon.stub();
  const commitCallbackStub = sinon.stub();
  const acquisitions = [
    {
      _id: 1,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {},
    },
  ];
  repository.findThenUpdate.resolves([acquisitions, updateCallbackStub, commitCallbackStub]);
  const inputData = {
    method: '',
    params: {},
    context: {
      call: { user: {} },
      channel: {
        service: '',
      },
    },
  };
  await action.call(inputData);

  const {
    kernelContext,
    kernelParams,
    kernelSignature,
  }: { kernelContext: any; kernelParams: any[]; kernelSignature: string } = kernel.call
    .getCalls()
    .map((c) => c.args)
    .reduce(
      ({ kernelSignature, kernelParams, kernelContext }, [signature, params, context]) => {
        kernelParams.push(params as never);
        kernelContext = context;
        kernelSignature = signature;
        return { kernelParams, kernelSignature, kernelContext };
      },
      { kernelSignature: '', kernelParams: [], kernelContext: {} },
    );
  t.is(kernelSignature, signature);
  t.deepEqual(kernelContext, callContext);
  t.deepEqual(kernelParams, [normalizedPayload]);
  t.true(updateCallbackStub.calledOnce);
  t.true(commitCallbackStub.calledOnce);
  const cbParams = updateCallbackStub.getCall(0).args[0];
  t.deepEqual(cbParams, {
    acquisition_id: 1,
    status: AcquisitionStatusEnum.Ok,
  });
});

test('should fail if normalization fail', async (t) => {
  const { action, repository, normalizer, kernel } = bootstrap();
  const normalizedPayload = { normalized: 'data' } as any;
  const normalizationError = new Error('normalization');
  normalizer.handle.callsFake(async (data) => {
    if (data._id === 1) {
      return normalizedPayload;
    }
    throw normalizationError;
  });
  const updateCallbackStub = sinon.stub();
  const commitCallbackStub = sinon.stub();
  const acquisitions = [
    {
      _id: 1,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {},
    },
    {
      _id: 2,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {},
    },
  ];
  repository.findThenUpdate.resolves([acquisitions, updateCallbackStub, commitCallbackStub]);
  const inputData = {
    method: '',
    params: {},
    context: {
      call: { user: {} },
      channel: {
        service: '',
      },
    },
  };
  await action.call(inputData);

  const {
    kernelContext,
    kernelParams,
    kernelSignature,
  }: { kernelContext: any; kernelParams: any[]; kernelSignature: string } = kernel.call
    .getCalls()
    .map((c) => c.args)
    .reduce(
      ({ kernelSignature, kernelParams, kernelContext }, [signature, params, context]) => {
        kernelParams.push(params as never);
        kernelContext = context;
        kernelSignature = signature;
        return { kernelParams, kernelSignature, kernelContext };
      },
      { kernelSignature: '', kernelParams: [], kernelContext: {} },
    );
  t.is(kernelSignature, signature);
  t.deepEqual(kernelContext, callContext);
  t.deepEqual(kernelParams, [normalizedPayload]);
  const calls = updateCallbackStub.getCalls().map((c) => c.args[0]);
  t.deepEqual(calls, [
    {
      acquisition_id: 1,
      status: AcquisitionStatusEnum.Ok,
    },
    {
      acquisition_id: 2,
      status: AcquisitionStatusEnum.Error,
      error_stage: AcquisitionErrorStageEnum.Normalisation,
      errors: [normalizationError.message],
    },
  ]);
});

test('should fail if carpool fail', async (t) => {
  const { action, repository, normalizer, kernel } = bootstrap();
  const normalizedPayload = { normalized: 'data' } as any;
  normalizer.handle.callsFake((data) => ({ ...normalizedPayload, acquisition_id: data._id }));
  sinon.stub(ProcessJourneyAction, 'killSwitch').callsFake(() => async () => {
    t.log('killSwitch');
  });
  const kernelError = new Error('Boum');
  kernel.call.callsFake(async (_method, params: any) => {
    if (params.acquisition_id === 2) {
      throw kernelError;
    }
  });
  const updateCallbackStub = sinon.stub();
  const commitCallbackStub = sinon.stub();
  const acquisitions = [
    {
      _id: 1,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {},
    },
    {
      _id: 2,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {},
    },
  ];
  repository.findThenUpdate.resolves([acquisitions, updateCallbackStub, commitCallbackStub]);
  const inputData = {
    method: '',
    params: {},
    context: {
      call: { user: {} },
      channel: {
        service: '',
      },
    },
  };
  await action.call(inputData);

  const calls = updateCallbackStub.getCalls().map((c) => c.args[0]);
  t.deepEqual(calls, [
    {
      acquisition_id: 1,
      status: AcquisitionStatusEnum.Ok,
    },
    {
      acquisition_id: 2,
      status: AcquisitionStatusEnum.Error,
      error_stage: AcquisitionErrorStageEnum.Normalisation,
      errors: [kernelError.message],
    },
  ]);
});
