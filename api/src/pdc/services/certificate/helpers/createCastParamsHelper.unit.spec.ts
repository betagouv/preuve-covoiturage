import {
  afterEach,
  assertObjectMatch,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import {
  createCastParamsHelper,
  ParamsInterface,
} from "./createCastParamsHelper.ts";

describe("create cast params helper", () => {
  let configStub: sinon.SinonStub;
  const configIR = new (class extends ConfigInterfaceResolver {})();
  const castParams = createCastParamsHelper<ParamsInterface>(configIR);
  let clock: sinon.SinonFakeTimers;
  const origin = new Date("2019-01-01T00:00:00+0100");
  const start_at_max = new Date(new Date().getTime() - 7 * 86400000);
  const end_at_max = new Date(new Date().getTime() - 6 * 86400000);

  beforeEach(() => {
    clock = sinon.useFakeTimers(new Date("2021-06-01T00:00:00Z"));
    configStub = sinon.stub(configIR, "get");
    configStub.returns(6);
  });

  afterEach(() => {
    clock.restore();
    configStub.restore();
  });

  it("regular dates 6 months ago", () => {
    const src: Required<ParamsInterface> = {
      start_at: new Date("2021-01-01T00:00:00Z"),
      end_at: new Date("2021-02-01T00:00:00Z"),
      positions: [],
    };

    assertObjectMatch(castParams(src), src);
  });

  it("missing start_at defaults to origin time", () => {
    const src: ParamsInterface = {
      end_at: new Date("2021-02-01T00:00:00Z"),
    };

    assertObjectMatch(castParams(src), {
      start_at: origin,
      end_at: new Date("2021-02-01T00:00:00Z"),
      positions: [],
    });
  });

  it("missing end_at defaults to end_at_max time", () => {
    const src: ParamsInterface = {
      start_at: new Date("2021-01-01T00:00:00Z"),
    };

    assertObjectMatch(castParams(src), {
      start_at: new Date("2021-01-01T00:00:00Z"),
      end_at: end_at_max,
      positions: [],
    });
  });

  it("start_at and end_at must be older than 6 days", () => {
    const src: ParamsInterface = {
      start_at: new Date("2021-06-01T00:00:00Z"),
      end_at: new Date("2021-06-02T00:00:00Z"),
    };

    assertObjectMatch(castParams(src), {
      start_at: start_at_max,
      end_at: end_at_max,
      positions: [],
    });
  });

  it("end_at must be older than 6 days", () => {
    const src: ParamsInterface = {
      start_at: new Date("2021-01-01T00:00:00Z"),
      end_at: new Date("2021-06-01T00:00:00Z"),
    };

    assertObjectMatch(castParams(src), {
      start_at: new Date("2021-01-01T00:00:00Z"),
      end_at: new Date("2021-05-26T00:00:00Z"),
      positions: [],
    });
  });

  it("start_at must be older than end_at, otherwise we set a 24 hours slot", () => {
    const src: ParamsInterface = {
      start_at: new Date("2021-01-03T00:00:00Z"),
      end_at: new Date("2021-01-02T00:00:00Z"),
    };

    assertObjectMatch(castParams(src), {
      start_at: new Date("2021-01-01T00:00:00Z"),
      end_at: new Date("2021-01-02T00:00:00Z"),
      positions: [],
    });
  });
});
