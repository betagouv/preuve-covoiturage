import {
  assert,
  assertEquals,
  assertObjectMatch,
  it,
  sinon,
} from "@/dev_deps.ts";
import { KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { ConfigStore } from "@/ilos/core/extensions/index.ts";
import { NormalizationProvider } from "@/pdc/providers/normalization/index.ts";
import { AcquisitionRepositoryProvider } from "../providers/AcquisitionRepositoryProvider.ts";
import { ProcessJourneyAction } from "./ProcessJourneyAction.ts";

import { signature } from "@/shared/carpool/crosscheck.contract.ts";
import { callContext } from "../config/callContext.ts";
import {
  AcquisitionErrorStageEnum,
  AcquisitionStatusEnum,
} from "../interfaces/AcquisitionRepositoryProviderInterface.ts";

function bootstrap(): {
  action: ProcessJourneyAction;
  repository: sinon.SinonStubbedInstance<AcquisitionRepositoryProvider>;
  kernel: sinon.SinonStubbedInstance<KernelInterfaceResolver>;
  normalizer: sinon.SinonStubbedInstance<NormalizationProvider>;
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

it("should process if normalization ok", async () => {
  const { action, repository, normalizer, kernel } = bootstrap();
  const normalizedPayload = { normalized: "data" } as any;
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
  repository.findThenUpdate.resolves([
    acquisitions,
    updateCallbackStub,
    commitCallbackStub,
  ]);
  const inputData = {
    method: "",
    params: {},
    context: {
      call: { user: {} },
      channel: {
        service: "",
      },
    },
  };
  await action.call(inputData);

  const {
    kernelContext,
    kernelParams,
    kernelSignature,
  }: { kernelContext: any; kernelParams: any[]; kernelSignature: string } =
    kernel.call
      .getCalls()
      .map((c: any) => c.args)
      .reduce(
        (
          { kernelSignature, kernelParams, kernelContext }: any,
          [signature, params, context]: [string, unknown, unknown],
        ) => {
          kernelParams.push(params as never);
          kernelContext = context;
          kernelSignature = signature;
          return { kernelParams, kernelSignature, kernelContext };
        },
        { kernelSignature: "", kernelParams: [], kernelContext: {} },
      );
  assertEquals(kernelSignature, signature);
  assertObjectMatch(kernelContext, callContext);
  assertEquals(kernelParams, [normalizedPayload]);
  assert(updateCallbackStub.calledOnce);
  assert(commitCallbackStub.calledOnce);
  const cbParams = updateCallbackStub.getCall(0).args[0];
  assertObjectMatch(cbParams, {
    acquisition_id: 1,
    status: AcquisitionStatusEnum.Ok,
  });
});

it("should fail if normalization fail", async () => {
  const { action, repository, normalizer, kernel } = bootstrap();
  const normalizedPayload = { normalized: "data" } as any;
  const normalizationError = new Error("normalization");
  normalizer.handle.callsFake(async (data: any) => {
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
  repository.findThenUpdate.resolves([
    acquisitions,
    updateCallbackStub,
    commitCallbackStub,
  ]);
  const inputData = {
    method: "",
    params: {},
    context: {
      call: { user: {} },
      channel: {
        service: "",
      },
    },
  };
  await action.call(inputData);

  const {
    kernelContext,
    kernelParams,
    kernelSignature,
  }: { kernelContext: any; kernelParams: any[]; kernelSignature: string } =
    kernel.call
      .getCalls()
      .map((c: any) => c.args)
      .reduce(
        (
          { kernelSignature, kernelParams, kernelContext }: any,
          [signature, params, context]: any,
        ) => {
          kernelParams.push(params as never);
          kernelContext = context;
          kernelSignature = signature;
          return { kernelParams, kernelSignature, kernelContext };
        },
        { kernelSignature: "", kernelParams: [], kernelContext: {} },
      );
  assertEquals(kernelSignature, signature);
  assertObjectMatch(kernelContext, callContext);
  assertEquals(kernelParams, [normalizedPayload]);
  const calls = updateCallbackStub.getCalls().map((c: any) => c.args[0]);
  assertEquals(calls, [
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

it("should fail if carpool fail", async () => {
  const { action, repository, normalizer, kernel } = bootstrap();
  const normalizedPayload = { normalized: "data" } as any;
  normalizer.handle.callsFake((data: any) => ({
    ...normalizedPayload,
    acquisition_id: data._id,
  }));
  const kernelError = new Error("Boum");
  kernel.call.callsFake(async (_method: string, params: any) => {
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
  repository.findThenUpdate.resolves([
    acquisitions,
    updateCallbackStub,
    commitCallbackStub,
  ]);
  const inputData = {
    method: "",
    params: {},
    context: {
      call: { user: {} },
      channel: {
        service: "",
      },
    },
  };
  await action.call(inputData);

  const calls = updateCallbackStub.getCalls().map((c: any) => c.args[0]);
  assertEquals(calls, [
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
