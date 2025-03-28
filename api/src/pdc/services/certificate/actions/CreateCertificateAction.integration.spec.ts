import { afterEach, assertEquals, beforeEach, describe, it, sinon } from "@/dev_deps.ts";
import { ConfigInterfaceResolver, ContextType, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import {
  CarpoolInterface,
  CarpoolTypeEnum,
} from "@/pdc/services/certificate/contracts/common/interfaces/CarpoolInterface.ts";
import { CertificateBaseInterface } from "@/pdc/services/certificate/contracts/common/interfaces/CertificateBaseInterface.ts";
import { CertificateInterface } from "@/pdc/services/certificate/contracts/common/interfaces/CertificateInterface.ts";
import { CertificateMetaInterface } from "@/pdc/services/certificate/contracts/common/interfaces/CertificateMetaInterface.ts";
import { ParamsInterface, ResultInterface } from "@/pdc/services/certificate/contracts/create.contract.ts";
import { faker } from "dep:faker";
import { mapFromCarpools } from "../helpers/mapFromCarpools.ts";
import { CarpoolRepositoryProviderInterfaceResolver } from "../interfaces/CarpoolRepositoryProviderInterface.ts";
import { CertificateRepositoryProviderInterfaceResolver } from "../interfaces/CertificateRepositoryProviderInterface.ts";
import { CreateCertificateAction } from "./CreateCertificateAction.ts";

describe("Create Certification Action", () => {
  let carpoolRepositoryFindStub: sinon.SinonStub;
  let certificateRepositoryCreateStub: sinon.SinonStub<
    [params: CertificateBaseInterface]
  >;
  let kernelCallStub: sinon.SinonStub<
    [method: string, params: any, context: ContextType]
  >;
  let configGetStub: sinon.SinonStub;

  let OPERATOR_UUID: string;
  let OPERATOR_NAME: string;
  let OPERATOR_SUPPORT: string;
  let RPC_IDENTITIES: { _id: number; uuid: string }[];
  let CERTIFICATE_UUID: string;

  const fakeKernelInterfaceResolver = new (class extends KernelInterfaceResolver {})();
  const configInterfaceResolver = new (class extends ConfigInterfaceResolver {})();
  const certificateRepositoryProviderInterface =
    new (class extends CertificateRepositoryProviderInterfaceResolver {})();
  const carpoolRepositoryProviderInterfaceResolver =
    new (class extends CarpoolRepositoryProviderInterfaceResolver {})();
  const createCertificateAction = new CreateCertificateAction(
    fakeKernelInterfaceResolver,
    certificateRepositoryProviderInterface,
    carpoolRepositoryProviderInterfaceResolver,
    configInterfaceResolver,
  );
  type CertMetaType = Omit<
    CertificateMetaInterface & { carpools: CarpoolInterface[] },
    "driver" | "passenger"
  >;

  const carpoolData: CarpoolInterface[] = [
    {
      type: CarpoolTypeEnum.DRIVER,
      datetime: new Date("2021-01-01"),
      trips: 15,
      distance: 100,
      amount: 10,
    },
    {
      type: CarpoolTypeEnum.DRIVER,
      datetime: new Date("2021-01-08"),
      trips: 10,
      distance: 100,
      amount: 10,
    },
    {
      type: CarpoolTypeEnum.DRIVER,
      datetime: new Date("2021-01-09"),
      trips: 10,
      distance: 100,
      amount: 10,
    },
    {
      type: CarpoolTypeEnum.DRIVER,
      datetime: new Date("2021-02-01"),
      trips: 2,
      distance: 10,
      amount: 1,
    },
    {
      type: CarpoolTypeEnum.PASSENGER,
      datetime: new Date("2021-01-01"),
      trips: 15,
      distance: 100,
      amount: 10,
    },
    {
      type: CarpoolTypeEnum.PASSENGER,
      datetime: new Date("2021-01-08"),
      trips: 10,
      distance: 100,
      amount: 10,
    },
    {
      type: CarpoolTypeEnum.PASSENGER,
      datetime: new Date("2021-01-09"),
      trips: 10,
      distance: 100,
      amount: 10,
    },
    {
      type: CarpoolTypeEnum.PASSENGER,
      datetime: new Date("2021-02-01"),
      trips: 2,
      distance: 10,
      amount: 1,
    },
    /* eslint-enable prettier/prettier */
  ];

  function getExpectedCertificateParams(
    certificateMeta: CertMetaType,
  ): CertificateBaseInterface {
    const { identity, operator, tz, positions, carpools } = certificateMeta;

    return mapFromCarpools({
      carpools,
      operator: { _id: 4, ...operator },
      person: { uuid: identity.uuid },
      params: {
        tz,
        positions,
        end_at: certificateRepositoryCreateStub.args[0][0].end_at,
        start_at: certificateRepositoryCreateStub.args[0][0].start_at,
      },
    });
  }

  function stubCertificateCreateAndGetParams() {
    certificateRepositoryCreateStub.resolves({
      _id: 1,
      uuid: CERTIFICATE_UUID,
      identity_uuid: RPC_IDENTITIES[0].uuid,
      operator_id: 4,
      meta: {
        identity: { uuid: RPC_IDENTITIES[0].uuid },
      },
    } as CertificateInterface);

    const params: ParamsInterface = {
      tz: "Europe/Paris",
      operator_id: 4,
      identity: { operator_user_id: faker.string.uuid() },
    };

    return params;
  }
  beforeEach(() => {
    OPERATOR_UUID = faker.string.uuid();
    RPC_IDENTITIES = [
      { _id: 1, uuid: faker.string.uuid() },
      { _id: 2, uuid: faker.string.uuid() },
    ];
    CERTIFICATE_UUID = faker.string.uuid();
    OPERATOR_NAME = faker.company.name();
    OPERATOR_SUPPORT = faker.internet.email();
    configGetStub = sinon.stub(configInterfaceResolver, "get");
    configGetStub.returns(6);
    certificateRepositoryCreateStub = sinon.stub(
      certificateRepositoryProviderInterface,
      "create",
    );
    carpoolRepositoryFindStub = sinon.stub(
      carpoolRepositoryProviderInterfaceResolver,
      "find",
    );
    kernelCallStub = sinon.stub(fakeKernelInterfaceResolver, "call");

    // operator:quickfind
    kernelCallStub
      .onCall(0)
      .resolves({
        uuid: OPERATOR_UUID,
        name: OPERATOR_NAME,
        support: OPERATOR_SUPPORT,
      });
  });

  afterEach(() => {
    configGetStub.restore();
    certificateRepositoryCreateStub.restore();
    carpoolRepositoryFindStub.restore();
    kernelCallStub.restore();
  });

  it("CreateCertificateAction: should generate certificate payload", async () => {
    // Arrange
    const params: ParamsInterface = stubCertificateCreateAndGetParams();
    carpoolRepositoryFindStub.resolves(carpoolData);

    // Act
    const result: ResultInterface = await createCertificateAction.handle(params, null as any);

    // Assert
    const expected: CertMetaType = {
      tz: "Europe/Paris",
      identity: { uuid: RPC_IDENTITIES[0].uuid },
      operator: {
        uuid: OPERATOR_UUID,
        name: OPERATOR_NAME,
        support: OPERATOR_SUPPORT,
      },
      positions: [],
      carpools: carpoolData,
    };

    const { meta, identity_uuid, ...expectCreateCertificateParams } = getExpectedCertificateParams(expected);

    sinon.assert.calledOnceWithMatch(
      certificateRepositoryCreateStub,
      expectCreateCertificateParams,
    );
    sinon.assert.calledOnce(carpoolRepositoryFindStub);
    sinon.assert.calledOnce(kernelCallStub);
    assertEquals(result.uuid, CERTIFICATE_UUID as string);
  });

  it("CreateCertificateAction: should return empty cert if no trips", async () => {
    // Arrange
    const params: ParamsInterface = stubCertificateCreateAndGetParams();
    carpoolRepositoryFindStub.resolves([]);

    // Act
    const result: ResultInterface = await createCertificateAction.handle(params, null as any);

    // Assert
    const expected: CertMetaType = {
      tz: "Europe/Paris",
      identity: { uuid: RPC_IDENTITIES[0].uuid },
      operator: {
        uuid: OPERATOR_UUID,
        name: OPERATOR_NAME,
        support: OPERATOR_SUPPORT,
      },
      positions: [],
      carpools: [],
    };

    const { meta, identity_uuid, ...expectCreateCertificateParams } = getExpectedCertificateParams(expected);

    sinon.assert.calledOnceWithMatch(
      certificateRepositoryCreateStub,
      expectCreateCertificateParams,
    );
    sinon.assert.calledOnce(carpoolRepositoryFindStub);
    sinon.assert.calledOnce(kernelCallStub);
    assertEquals(result.uuid, CERTIFICATE_UUID);
  });
});
