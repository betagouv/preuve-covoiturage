/* eslint-disable max-len */
import { ConfigInterfaceResolver, ContextType, KernelInterfaceResolver } from '@ilos/common';
import anyTest, { TestInterface } from 'ava';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolInterface, CarpoolTypeEnum } from '../shared/certificate/common/interfaces/CarpoolInterface';
import { CertificateBaseInterface } from '../shared/certificate/common/interfaces/CertificateBaseInterface';
import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CertificateMetaInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { ParamsInterface, ResultInterface } from '../shared/certificate/create.contract';
import { WithHttpStatus } from '../shared/common/handler/WithHttpStatus';
import { CreateCertificateAction } from './CreateCertificateAction';

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
  USER_RPC_UUID: string;
  CERTIFICATE_UUID: string;

  // Tested token
  createCertificateAction: CreateCertificateAction;
}

const test = anyTest as TestInterface<Partial<Context>>;

const data: CarpoolInterface[] = [
  /* eslint-disable prettier/prettier */
  { type: CarpoolTypeEnum.DRIVER, week: 1, month: null, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
  { type: CarpoolTypeEnum.DRIVER, week: 2, month: null, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
  { type: CarpoolTypeEnum.DRIVER, week: 3, month: null, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
  { type: CarpoolTypeEnum.DRIVER, week: 5, month: null, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
  { type: CarpoolTypeEnum.DRIVER, week: null, month: null, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
  { type: CarpoolTypeEnum.PASSENGER, week: 1, month: null, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
  { type: CarpoolTypeEnum.PASSENGER, week: 2, month: null, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
  { type: CarpoolTypeEnum.PASSENGER, week: 3, month: null, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
  { type: CarpoolTypeEnum.PASSENGER, week: 5, month: null, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
  { type: CarpoolTypeEnum.PASSENGER, week: null, month: null, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
  { type: CarpoolTypeEnum.DRIVER, week: null, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
  { type: CarpoolTypeEnum.DRIVER, week: null, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
  { type: CarpoolTypeEnum.PASSENGER, week: null, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
  { type: CarpoolTypeEnum.PASSENGER, week: null, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
  /* eslint-enable prettier/prettier */
];

test.beforeEach((t) => {
  const fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  const configInterfaceResolver = new (class extends ConfigInterfaceResolver {})();
  const certificateRepositoryProviderInterface = new (class extends CertificateRepositoryProviderInterfaceResolver {})();
  const carpoolRepositoryProviderInterfaceResolver = new (class extends CarpoolRepositoryProviderInterfaceResolver {})();
  const createCertificateAction = new CreateCertificateAction(
    fakeKernelInterfaceResolver,
    certificateRepositoryProviderInterface,
    carpoolRepositoryProviderInterfaceResolver,
    configInterfaceResolver,
  );

  // Unchanged stubs results
  const configGetStub = sinon.stub(configInterfaceResolver, 'get');
  configGetStub.returns(6);

  t.context = {
    OPERATOR_UUID: faker.datatype.uuid(),
    USER_RPC_UUID: faker.datatype.uuid(),
    CERTIFICATE_UUID: faker.datatype.uuid(),
    OPERATOR_NAME: faker.random.alpha(),
    fakeKernelInterfaceResolver,
    configInterfaceResolver,
    certificateRepositoryProviderInterface,
    carpoolRepositoryProviderInterfaceResolver,
    createCertificateAction,
    configGetStub,
  };
  t.context.certificateRepositoryCreateStub = sinon.stub(t.context.certificateRepositoryProviderInterface, 'create');
  t.context.carpoolRepositoryFindStub = sinon.stub(t.context.carpoolRepositoryProviderInterfaceResolver, 'find');
  t.context.kernelCallStub = sinon.stub(t.context.fakeKernelInterfaceResolver, 'call');

  t.context.kernelCallStub.onCall(0).resolves(t.context.USER_RPC_UUID);
  t.context.kernelCallStub.onCall(1).resolves({ uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME });
});

test.afterEach((t) => {
  t.context.certificateRepositoryCreateStub.restore();
  t.context.carpoolRepositoryFindStub.restore();
  t.context.kernelCallStub.restore();
});

test('CreateCertificateAction: should generate certificate payload', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves(data);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  /* eslint-disable prettier/prettier */
  const expected: Pick<CertificateMetaInterface, 'driver' | 'passenger'> = {
    driver: {
      weeks: [
        { type: CarpoolTypeEnum.DRIVER, week: 1, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.DRIVER, week: 2, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.DRIVER, week: 3, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.DRIVER, week: 5, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
      ],
      months: [
        { type: CarpoolTypeEnum.DRIVER, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
        { type: CarpoolTypeEnum.DRIVER, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },      
      ],
      total: { type: CarpoolTypeEnum.DRIVER, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
    },
    passenger: {
      weeks: [
        { type: CarpoolTypeEnum.PASSENGER, week: 1, datetime: new Date('2021-01-01'), uniq_days: 7, trips: 15, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.PASSENGER, week: 2, datetime: new Date('2021-01-08'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.PASSENGER, week: 3, datetime: new Date('2021-01-15'), uniq_days: 5, trips: 10, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: false, dim: false, km: 100, euros: 10 },
        { type: CarpoolTypeEnum.PASSENGER, week: 5, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },
      ],
      months: [
        { type: CarpoolTypeEnum.PASSENGER, month: 1, datetime: new Date('2021-01-01'), uniq_days: 17, trips: 35, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 300, euros: 30 },
        { type: CarpoolTypeEnum.PASSENGER, month: 2, datetime: new Date('2021-02-01'), uniq_days: 1, trips: 2, lun: true, mar: false, mer: false, jeu: false, ven: false, sam: false, dim: false, km: 10, euros: 1 },      
      ],
      total: { type: CarpoolTypeEnum.PASSENGER, datetime: new Date('2021-01-01'), uniq_days: 18, trips: 37, lun: true, mar: true, mer: true, jeu: true, ven: true, sam: true, dim: true, km: 310, euros: 31 },
    },
  /* eslint-enable prettier/prettier */
  };

  const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams(expected, t);
  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID);
});

test.skip('CreateCertificateAction: should return empty cert if no trips', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves([]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  const expected: CertificateMetaInterface = {
    tz: 'Europe/Paris',
    identity: { uuid: t.context.USER_RPC_UUID },
    operator: { uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME },
    driver: { weeks: [], months: [], total: null },
    passenger: { weeks: [], months: [], total: null },
  };
  const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams(expected, t);

  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID);
});

function getExpectedCertificateParams(certificateMeta: Partial<CertificateMetaInterface>, t): CertificateBaseInterface {
  return {
    meta: {
      tz: 'Europe/Paris',
      identity: { uuid: t.context.USER_RPC_UUID },
      operator: { uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME },
      ...certificateMeta,
    } as CertificateMetaInterface,
    end_at: t.context.certificateRepositoryCreateStub.args[0][0].end_at,
    start_at: t.context.certificateRepositoryCreateStub.args[0][0].start_at,
    operator_id: 4,
    identity_uuid: t.context.USER_RPC_UUID,
  };
}

function stubCertificateCreateAndGetParams(t) {
  t.context.certificateRepositoryCreateStub.resolves({
    _id: 1,
    uuid: t.context.CERTIFICATE_UUID,
    identity_uuid: t.context.USER_RPC_UUID,
    operator_id: 4,
    meta: {
      identity: { uuid: t.context.USER_RPC_UUID },
    },
  } as CertificateInterface);
  const params: ParamsInterface = {
    tz: 'Europe/Paris',
    operator_id: 4,
    identity: {
      phone_trunc: '+33696989598',
      uuid: t.context.USER_RPC_UUID,
    },
  };
  return params;
}
