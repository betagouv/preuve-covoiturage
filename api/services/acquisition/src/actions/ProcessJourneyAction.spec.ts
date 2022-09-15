import test from 'ava';
import sinon, { SinonStubbedInstance } from 'sinon';
import { ProcessJourneyAction } from './ProcessJourneyAction';
import { AcquisitionRepositoryProvider } from '../providers/AcquisitionRepositoryProvider';
import { ParseErrorException, KernelInterfaceResolver } from '@ilos/common';
import { NormalizationProvider } from '@pdc/provider-normalization';
import { AcquisitionErrorStageEnum, AcquisitionStatusEnum } from '../interfaces/AcquisitionRepositoryProviderInterface';
import { sign } from 'crypto';
import { signature } from '../shared/carpool/crosscheck.contract';
import { callContext } from '../config/callContext';

function bootstap(): {
  action: ProcessJourneyAction;
  repository: SinonStubbedInstance<AcquisitionRepositoryProvider>;
  kernel: SinonStubbedInstance<KernelInterfaceResolver>;
  normalizer: SinonStubbedInstance<NormalizationProvider>;
} {
  const repository = sinon.createStubInstance(AcquisitionRepositoryProvider);
  const kernel = sinon.createStubInstance(KernelInterfaceResolver);
  const normalizer = sinon.createStubInstance(NormalizationProvider);
  const action = new ProcessJourneyAction(repository, normalizer, kernel);
  return { action, repository, kernel, normalizer };
}

test('should process if normalization ok', async (t) => {
  const { action, repository, normalizer, kernel } = bootstap();
  const normalizedPayload = Symbol() as any;
  normalizer.handle.resolves(normalizedPayload);
  const cbStub = sinon.stub();
  const acquisitions = [
    {
      _id: 1,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {},
    },
  ];
  repository.findThenUpdate.resolves([acquisitions, cbStub]);
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
  t.true(cbStub.calledOnce);
  const cbParams = cbStub.getCall(0).args[0];
  t.deepEqual(cbParams, [
    {
      acquisition_id: 1,
      status: AcquisitionStatusEnum.Ok,
    },
  ]);
});

test('should fail if normalization fail', async (t) => {
  const { action, repository, normalizer, kernel } = bootstap();
  const normalizedPayload = Symbol() as any;
  const normalizationError = new Error('normalization');
  normalizer.handle.callsFake(async (data) => {
    if (data._id === 1) {
      return normalizedPayload;
    }
    throw normalizationError;
  });
  const cbStub = sinon.stub();
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
  repository.findThenUpdate.resolves([acquisitions, cbStub]);
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
  t.true(cbStub.calledOnce);
  const cbParams = cbStub.getCall(0).args[0];
  t.deepEqual(cbParams, [
    {
      acquisition_id: 1,
      status: AcquisitionStatusEnum.Ok,
    },
    {
      acquisition_id: 2,
      status: AcquisitionStatusEnum.Error,
      error_stage: AcquisitionErrorStageEnum.Normalisation,
      errors: [normalizationError],
    },
  ]);
});

test('should normalize person', async (t) => {
  const { action, repository, normalizer } = bootstap();
  const cbStub = sinon.stub();
  const acquisitions = [
    {
      _id: 1,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {
        driver: {},
        passenger: {},
      },
    },
    {
      _id: 2,
      operator_id: 1,
      api_version: 2,
      created_at: new Date(),
      payload: {
        driver: {},
        passenger: { seats: 2 },
      },
    },
  ];
  repository.findThenUpdate.resolves([acquisitions, cbStub]);
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

  const normalizerArgs = normalizer.handle
    .getCalls()
    .map((c) => c.args[0])
    .map((c) => c.payload);
  t.deepEqual(normalizerArgs, [
    {
      driver: {
        expense: 0,
        incentives: [],
        is_driver: true,
        payments: [],
        seats: 0,
      },
      passenger: {
        expense: 0,
        incentives: [],
        is_driver: false,
        payments: [],
        seats: 1,
      },
    },
    {
      driver: {
        expense: 0,
        incentives: [],
        is_driver: true,
        payments: [],
        seats: 0,
      },
      passenger: {
        expense: 0,
        incentives: [],
        is_driver: false,
        payments: [],
        seats: 2,
      },
    },
  ] as any);
});
