/* eslint-disable max-len */
import { ConfigInterfaceResolver, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { DateProvider } from '@pdc/provider-date/dist';
import anyTest, { TestInterface } from 'ava';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { CarpoolRepositoryProviderInterfaceResolver } from '../interfaces/CarpoolRepositoryProviderInterface';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
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

test.beforeEach((t) => {
  const fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  const configInterfaceResolver = new (class extends ConfigInterfaceResolver {})();
  const certificateRepositoryProviderInterface = new (class extends CertificateRepositoryProviderInterfaceResolver {})();
  const carpoolRepositoryProviderInterfaceResolver = new (class extends CarpoolRepositoryProviderInterfaceResolver {})();
  const createCertificateAction = new CreateCertificateAction(
    fakeKernelInterfaceResolver,
    certificateRepositoryProviderInterface,
    carpoolRepositoryProviderInterfaceResolver,
    new DateProvider(),
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

test('CreateCertificateAction: should generate certificate with 0 rac amount for 2 trips with operator incentive', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves([
    {
      month: 9,
      year: 2021,
      type: 'passenger',
      trip_id: faker.datatype.uuid(),
      km: 10,
      rac: 1.5,
      payments: JSON.stringify([
        {
          siret: faker.random.alphaNumeric(),
          index: 0,
          type: 'incentive',
          amount: 150,
        },
      ]),
    },
    {
      month: 9,
      year: 2021,
      type: 'passenger',
      trip_id: faker.datatype.uuid(),
      km: 10,
      rac: 1.5,
      payments: JSON.stringify([
        {
          siret: faker.random.alphaNumeric(),
          index: 0,
          type: 'incentive',
          amount: 150,
        },
      ]),
    },
  ]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  const expectCreateCertificateParams: CertificateBaseInterface = {
    meta: {
      tz: 'Europe/Paris',
      identity: { uuid: t.context.USER_RPC_UUID },
      operator: { uuid: t.context.OPERATOR_UUID, name: t.context.OPERATOR_NAME },
      total_tr: 2,
      total_km: 20,
      total_rm: 0,
      total_point: 0,
      rows: [{ month: 'Septembre 2021', index: 0, distance: 20, remaining: 0, trips: 2 }],
    },
    end_at: t.context.certificateRepositoryCreateStub.args[0][0].end_at,
    start_at: t.context.certificateRepositoryCreateStub.args[0][0].start_at,
    operator_id: 4,
    identity_uuid: t.context.USER_RPC_UUID,
  };
  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID);
});

test('CreateCertificateAction: should generate certificate with 0 rac for 2 trips with operator incentive and 0 rpc rac', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves([
    {
      month: 9,
      year: 2021,
      type: 'passenger',
      trip_id: faker.datatype.uuid(),
      km: 10,
      rac: 0,
      payments: JSON.stringify([
        {
          siret: faker.random.alphaNumeric(),
          index: 0,
          type: 'incentive',
          amount: 150,
        },
      ]),
    },
    {
      month: 9,
      year: 2021,
      type: 'passenger',
      trip_id: faker.datatype.uuid(),
      km: 10,
      rac: 0,
      payments: JSON.stringify([
        {
          siret: faker.random.alphaNumeric(),
          index: 0,
          type: 'incentive',
          amount: 150,
        },
      ]),
    },
  ]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);
  const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams(
    {
      total_tr: 2,
      total_km: 20,
      total_rm: 0,
      total_point: 0,
      rows: [
        {
          month: 'Septembre 2021',
          index: 0,
          distance: 20,
          remaining: 0,
          trips: 2,
        },
      ],
    },
    t,
  );

  // Assert
  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID);
});

test('CreateCertificateAction: should generate certificate with rac amount split by month', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves([
    {
      month: 9,
      year: 2021,
      type: 'passenger',
      trip_id: faker.datatype.uuid(),
      km: 10,
      rac: 1.5,
      payments: JSON.stringify([
        {
          siret: faker.random.alphaNumeric(),
          index: 0,
          type: 'payment',
          amount: 150,
        },
      ]),
    },
    {
      month: 8,
      year: 2021,
      type: 'passenger',
      trip_id: faker.datatype.uuid(),
      km: 10,
      rac: 1.5,
      payments: JSON.stringify([
        {
          siret: faker.random.alphaNumeric(),
          index: 0,
          type: 'payment',
          amount: 150,
        },
      ]),
    },
  ]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams(
    {
      total_tr: 2,
      total_km: 20,
      total_rm: 3,
      total_point: 0,
      rows: [
        {
          month: 'Septembre 2021',
          index: 0,
          distance: 10,
          remaining: 1.5,
          trips: 1,
        },
        {
          month: 'Août 2021',
          index: 1,
          distance: 10,
          remaining: 1.5,
          trips: 1,
        },
      ],
    },
    t,
  );
  sinon.assert.calledOnceWithExactly(t.context.certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(t.context.carpoolRepositoryFindStub);
  sinon.assert.calledTwice(t.context.kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, t.context.CERTIFICATE_UUID);
});

test('CreateCertificateAction: should return empty cert if no trips', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams(t);
  t.context.carpoolRepositoryFindStub.resolves([]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await t.context.createCertificateAction.handle(params, null);

  // Assert
  const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams(
    {
      total_tr: 0,
      total_km: 0,
      total_rm: 0,
      total_point: 0,
      rows: [],
    },
    t,
  );
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
