/* eslint-disable max-len */
import { ConfigInterfaceResolver, ContextType, KernelInterfaceResolver } from '/ilos/common/index.ts';
import anyTest, { ExecutionContext, TestFn } from 'ava';
import { faker } from '@faker-js/faker';
import sinon, { SinonStub } from 'sinon';
import { mapFromCarpools } from '../helpers/mapFromCarpools.ts';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface.ts';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface.ts';
import { CarpoolInterface, CarpoolTypeEnum } from '/shared/certificate/common/interfaces/CarpoolInterface.ts';
import { CertificateBaseInterface } from '/shared/certificate/common/interfaces/CertificateBaseInterface.ts';
import { CertificateInterface } from '/shared/certificate/common/interfaces/CertificateInterface.ts';
import { CertificateMetaInterface } from '/shared/certificate/common/interfaces/CertificateMetaInterface.ts';
import { ParamsInterface, ResultInterface } from '/shared/certificate/create.contract.ts';
import { WithHttpStatus } from '/shared/common/handler/WithHttpStatus.ts';
import { CreateCertificateAction } from './CreateCertificateAction.ts';

interface Context {
  // Injected tokens
  fakeKernelInterfaceResolver: KernelInterfaceResolver;
  certificateRepositoryProviderInterface: CertificateRepositoryProviderInterfaceResolver;
  carpoolRepositoryProviderInterfaceResolver: CarpoolRepositoryProviderInterfaceResolver;
  configInterfaceResolver: ConfigInterfaceResolver;

  // Injected tokens method's stubs
  carpoolRepositoryFindStub: SinonStub;
  certificateRepositoryCreateStub: SinonStub<[params: CertificateBaseInterface]>;
  kernelCallStub: SinonStub<[method: string, params: any, context: ContextType]>;
  configGetStub: SinonStub;

  // Constants
  OPERATOR_UUID: string;
  OPERATOR_NAME: string;
  OPERATOR_SUPPORT: string;
  RPC_IDENTITIES: { _id: number; uuid: string }[];
  CERTIFICATE_UUID: string;

  // Tested token
  createCertificateAction: CreateCertificateAction;
}

type CertMetaType = Omit<CertificateMetaInterface & { carpools: CarpoolInterface[] }, 'driver' | 'passenger'>;

const test = anyTest as TestFn<Context>;

const carpoolData: CarpoolInterface[] = [
  /* eslint-disable prettier/prettier */
  { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-01'), trips: 15, distance: 100, amount: 10 },
  { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-08'), trips: 10, distance: 100, amount: 10 },
  { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
  { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
  { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-01'), trips: 15, distance: 100, amount: 10 },
  { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-08'), trips: 10, distance: 100, amount: 10 },
  { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-09'), trips: 10, distance: 100, amount: 10 },
  { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-02-01'), trips: 2, distance: 10, amount: 1 },
  /* eslint-enable prettier/prettier */
];

test.beforeEach((t) => {
  /* eslint-disable prettier/prettier */
  const fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  const configInterfaceResolver = new (class extends ConfigInterfaceResolver {})();
  const certificateRepositoryProviderInterface = new (class extends CertificateRepositoryProviderInterfaceResolver {})();
  const carpoolRepositoryProviderInterfaceResolver = new (class extends CarpoolRepositoryProviderInterfaceResolver {})();
  const createCertificateAction = new CreateCertificateAction(fakeKernelInterfaceResolver, certificateRepositoryProviderInterface, carpoolRepositoryProviderInterfaceResolver, configInterfaceResolver);
  /* eslint-enable prettier/prettier */

  // Unchanged stubs results
  const configGetStub = sinon.stub(configInterfaceResolver, 'get');
  configGetStub.returns(6);
  t.context = {
    OPERATOR_UUID: faker.string.uuid(),
    RPC_IDENTITIES: [
      { _id: 1, uuid: faker.string.uuid() },
      { _id: 2, uuid: faker.string.uuid() },
    ],
    CERTIFICATE_UUID: faker.string.uuid(),
    OPERATOR_NAME: faker.company.name(),
    OPERATOR_SUPPORT: faker.internet.email(),
    fakeKernelInterfaceResolver,
    configInterfaceResolver,
    certificateRepositoryProviderInterface,
    carpoolRepositoryProviderInterfaceResolver,
    createCertificateAction,
    configGetStub,
    certificateRepositoryCreateStub: sinon.stub(certificateRepositoryProviderInterface, 'create'),
    carpoolRepositoryFindStub: sinon.stub(carpoolRepositoryProviderInterfaceResolver, 'find'),
    kernelCallStub: sinon.stub(fakeKernelInterfaceResolver, 'call'),
  };

  // kernel is called inside repository methods
  // carpool:findidentities
  t.context.kernelCallStub.onCall(0).resolves(t.context.RPC_IDENTITIES);

  // operator:quickfind
  t.context.kernelCallStub
    .onCall(1)
    .resolves({ uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME, support: t.context.OPERATOR_SUPPORT });
});

test.afterEach((t) => {
  t.context.certificateRepositoryCreateStub.restore();
  t.context.carpoolRepositoryFindStub.restore();
  t.context.kernelCallStub.restore();
});

test('CreateCertificateAction: should generate certificate payload', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves(carpoolData);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  const expected: CertMetaType = {
    tz: 'Europe/Paris',
    identity: { uuid: t.context.RPC_IDENTITIES[0].uuid },
    operator: { uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME, support: t.context.OPERATOR_SUPPORT },
    positions: [],
    carpools: carpoolData,
  };

  const expectCreateCertificateParams = getExpectedCertificateParams(expected, t);
  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID as string);
});

test('CreateCertificateAction: should return empty cert if no trips', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves([]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  const expected: CertMetaType = {
    tz: 'Europe/Paris',
    identity: { uuid: t.context.RPC_IDENTITIES[0].uuid },
    operator: { uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME, support: t.context.OPERATOR_SUPPORT },
    positions: [],
    carpools: [],
  };

  const expectCreateCertificateParams = getExpectedCertificateParams(expected, t);

  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID);
});

function getExpectedCertificateParams(
  certificateMeta: CertMetaType,
  t: ExecutionContext<Context>,
): CertificateBaseInterface {
  const { identity, operator, tz, positions, carpools } = certificateMeta;

  return mapFromCarpools({
    carpools,
    operator: { _id: 4, ...operator },
    person: { uuid: identity.uuid },
    params: {
      tz,
      positions,
      end_at: t.context.certificateRepositoryCreateStub.args[0][0].end_at,
      start_at: t.context.certificateRepositoryCreateStub.args[0][0].start_at,
    },
  });
}

function stubCertificateCreateAndGetParams(t: ExecutionContext<Context>) {
  t.context.certificateRepositoryCreateStub.resolves({
    _id: 1,
    uuid: t.context.CERTIFICATE_UUID,
    identity_uuid: t.context.RPC_IDENTITIES[0].uuid,
    operator_id: 4,
    meta: {
      identity: { uuid: t.context.RPC_IDENTITIES[0].uuid },
    },
  } as CertificateInterface);

  const params: ParamsInterface = {
    tz: 'Europe/Paris',
    operator_id: 4,
    identity: { operator_user_id: faker.string.uuid() },
  };

  return params;
}
