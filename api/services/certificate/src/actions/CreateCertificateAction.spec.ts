import { ConfigInterfaceResolver, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { DateProvider } from '@pdc/provider-date/dist';
import test, { serial } from 'ava';
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

// Tested token
let createCertificateAction: CreateCertificateAction;

// Injected tokens
let fakeKernelInterfaceResolver: KernelInterfaceResolver;
let certificateRepositoryProviderInterface: CertificateRepositoryProviderInterfaceResolver;
let carpoolRepositoryProviderInterfaceResolver: CarpoolRepositoryProviderInterfaceResolver;
let configInterfaceResolver: ConfigInterfaceResolver;

// Injected tokens method's stubs
let carpoolRepositoryFindStub: SinonStub;
let certificateRepositoryCreateStub: SinonStub<[params: CertificateBaseInterface]>;
let kernelCallStub: SinonStub<[method: string, params: any, context: ContextType]>;
let configGetStub: SinonStub;

// Constants
const OPERATOR_UUID: string = faker.random.uuid();
const USER_RPC_UUID: string = faker.random.uuid();
const CERTIFICATE_UUID: string = faker.random.uuid();

test.before(() => {
  fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  configInterfaceResolver = new (class extends ConfigInterfaceResolver {})();
  certificateRepositoryProviderInterface = new (class extends CertificateRepositoryProviderInterfaceResolver {})();
  carpoolRepositoryProviderInterfaceResolver = new (class extends CarpoolRepositoryProviderInterfaceResolver {})();
  createCertificateAction = new CreateCertificateAction(
    fakeKernelInterfaceResolver,
    certificateRepositoryProviderInterface,
    carpoolRepositoryProviderInterfaceResolver,
    new DateProvider(),
    configInterfaceResolver,
  );

  // Unchanged stubs results
  configGetStub = sinon.stub(configInterfaceResolver, 'get');
  configGetStub.returns(6);
});

test.beforeEach(() => {
  certificateRepositoryCreateStub = sinon.stub(certificateRepositoryProviderInterface, 'create');
  carpoolRepositoryFindStub = sinon.stub(carpoolRepositoryProviderInterfaceResolver, 'find');
  kernelCallStub = sinon.stub(fakeKernelInterfaceResolver, 'call');
  kernelCallStub.onCall(0).resolves(USER_RPC_UUID);
  kernelCallStub.onCall(1).resolves({ uuid: OPERATOR_UUID, name: 'Klaxit' });
});

test.afterEach(() => {
  certificateRepositoryCreateStub.restore();
  carpoolRepositoryFindStub.restore();
  kernelCallStub.restore();
});

serial(
  'CreateCertificateAction: should generate certificate with 0 rac amount for 2 trips with operator incentive',
  async (t) => {
    // Arrange
    const params: ParamsInterface = stubCertificateCreateAndGetParams();
    carpoolRepositoryFindStub.resolves([
      {
        month: 9,
        year: 2021,
        type: 'passenger',
        trip_id: faker.random.uuid(),
        km: 10,
        rac: 1.5,
        payments: JSON.stringify([{ siret: faker.random.alphaNumeric(), index: 0, type: 'incentive', amount: 150 }]),
      },
      {
        month: 9,
        year: 2021,
        type: 'passenger',
        trip_id: faker.random.uuid(),
        km: 10,
        rac: 1.5,
        payments: JSON.stringify([{ siret: faker.random.alphaNumeric(), index: 0, type: 'incentive', amount: 150 }]),
      },
    ]);

    // Act
    const result: WithHttpStatus<ResultInterface> = await createCertificateAction.handle(params, null);

    // Assert
    const expectCreateCertificateParams: CertificateBaseInterface = {
      meta: {
        tz: 'Europe/Paris',
        identity: { uuid: USER_RPC_UUID },
        operator: { uuid: OPERATOR_UUID, name: 'Klaxit' },
        total_tr: 2,
        total_km: 20,
        total_rm: 0,
        total_point: 0,
        rows: [{ month: 'Août 2021', index: 0, distance: 20, remaining: 0, trips: 2 }],
      },
      end_at: certificateRepositoryCreateStub.args[0][0].end_at,
      start_at: new Date('2019-01-01T00:00:00+0100'),
      operator_id: 4,
      identity_uuid: USER_RPC_UUID,
    };
    sinon.assert.calledOnceWithExactly(certificateRepositoryCreateStub, expectCreateCertificateParams);
    sinon.assert.calledOnce(carpoolRepositoryFindStub);
    sinon.assert.calledTwice(kernelCallStub);
    t.is(result.meta.httpStatus, 201);
    t.is(result.data.uuid, CERTIFICATE_UUID);
  },
);

serial(
  'CreateCertificateAction: should generate certificate with 0 rac for 2 trips with operator incentive and 0 rpc rac',
  async (t) => {
    // Arrange
    const params: ParamsInterface = stubCertificateCreateAndGetParams();
    carpoolRepositoryFindStub.resolves([
      {
        month: 9,
        year: 2021,
        type: 'passenger',
        trip_id: faker.random.uuid(),
        km: 10,
        rac: 0,
        payments: JSON.stringify([{ siret: faker.random.alphaNumeric(), index: 0, type: 'incentive', amount: 150 }]),
      },
      {
        month: 9,
        year: 2021,
        type: 'passenger',
        trip_id: faker.random.uuid(),
        km: 10,
        rac: 0,
        payments: JSON.stringify([{ siret: faker.random.alphaNumeric(), index: 0, type: 'incentive', amount: 150 }]),
      },
    ]);

    // Act
    const result: WithHttpStatus<ResultInterface> = await createCertificateAction.handle(params, null);
    const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams({
      total_tr: 2,
      total_km: 20,
      total_rm: 0,
      total_point: 0,
      rows: [{ month: 'Août 2021', index: 0, distance: 20, remaining: 0, trips: 2 }],
    });

    // Assert
    sinon.assert.calledOnceWithExactly(certificateRepositoryCreateStub, expectCreateCertificateParams);
    sinon.assert.calledOnce(carpoolRepositoryFindStub);
    sinon.assert.calledTwice(kernelCallStub);
    t.is(result.meta.httpStatus, 201);
    t.is(result.data.uuid, CERTIFICATE_UUID);
  },
);

serial('CreateCertificateAction: should generate certificate with rac amount split by month', async (t) => {
  // Arrange
  const params: ParamsInterface = stubCertificateCreateAndGetParams();
  carpoolRepositoryFindStub.resolves([
    {
      month: 9,
      year: 2021,
      type: 'passenger',
      trip_id: faker.random.uuid(),
      km: 10,
      rac: 1.5,
      payments: JSON.stringify([{ siret: faker.random.alphaNumeric(), index: 0, type: 'payment', amount: 150 }]),
    },
    {
      month: 8,
      year: 2021,
      type: 'passenger',
      trip_id: faker.random.uuid(),
      km: 10,
      rac: 1.5,
      payments: JSON.stringify([{ siret: faker.random.alphaNumeric(), index: 0, type: 'payment', amount: 150 }]),
    },
  ]);

  // Act
  const result: WithHttpStatus<ResultInterface> = await createCertificateAction.handle(params, null);

  // Assert
  const expectCreateCertificateParams: CertificateBaseInterface = getExpectedCertificateParams({
    total_tr: 2,
    total_km: 20,
    total_rm: 3,
    total_point: 0,
    rows: [
      { month: 'Août 2021', index: 0, distance: 10, remaining: 1.5, trips: 1 },
      { month: 'Juillet 2021', index: 1, distance: 10, remaining: 1.5, trips: 1 },
    ],
  });
  sinon.assert.calledOnceWithExactly(certificateRepositoryCreateStub, expectCreateCertificateParams);
  sinon.assert.calledOnce(carpoolRepositoryFindStub);
  sinon.assert.calledTwice(kernelCallStub);
  t.is(result.meta.httpStatus, 201);
  t.is(result.data.uuid, CERTIFICATE_UUID);
});

function getExpectedCertificateParams(certificateMeta: Partial<CertificateMetaInterface>): CertificateBaseInterface {
  return {
    meta: {
      tz: 'Europe/Paris',
      identity: { uuid: USER_RPC_UUID },
      operator: { uuid: OPERATOR_UUID, name: 'Klaxit' },
      ...certificateMeta,
    } as CertificateMetaInterface,
    end_at: certificateRepositoryCreateStub.args[0][0].end_at,
    start_at: new Date('2019-01-01T00:00:00+0100'),
    operator_id: 4,
    identity_uuid: USER_RPC_UUID,
  };
}

function stubCertificateCreateAndGetParams() {
  certificateRepositoryCreateStub.resolves({
    _id: 1,
    uuid: CERTIFICATE_UUID,
    identity_uuid: USER_RPC_UUID,
    operator_id: 4,
    meta: {
      identity: { uuid: USER_RPC_UUID },
    },
  } as CertificateInterface);
  const params: ParamsInterface = {
    tz: 'Europe/Paris',
    operator_id: 4,
    identity: {
      phone_trunc: '+33696989598',
      uuid: USER_RPC_UUID,
    },
  };
  return params;
}
