import { assertEquals, assertMatch } from "dep:assert";
import { afterEach, beforeEach, describe, it } from "dep:testing-bdd";
import sinon from "dep:sinon";
import { logger } from "@/lib/logger/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { ProcessGeoCommand } from "./ProcessGeoCommand.ts";

describe("ProcessGeoCommand", () => {
  let info: sinon.SinonStub;
  let processGeo: sinon.SinonStub;
  let command: ProcessGeoCommand;

  const opts = {
    loop: true,
    size: 2,
    after: new Date("2026-10-01T00:00:00Z"),
    until: new Date("2026-10-02T00:00:00Z"),
    lastDays: 0,
    failed: false,
  };

  beforeEach(() => {
    info = sinon.stub(logger, "info");
    processGeo = sinon.stub();
    command = new ProcessGeoCommand({ processGeo } as unknown as CarpoolAcquisitionService);
  });

  afterEach(() => sinon.restore());

  const lines = () => info.getCalls().map((c) => c.args[0] as string);

  it("logs the window at start", async () => {
    processGeo.resolves({ count: 0, failed: 0 });
    await command.call(opts);
    assertEquals(
      lines()[0],
      "[geo] start from=2026-10-01T00:00:00.000Z to=2026-10-02T00:00:00.000Z size=2 loop=true failed_only=false",
    );
  });

  it("logs cumulative progress and cursor for each batch", async () => {
    processGeo.onFirstCall().resolves({ count: 2, failed: 1, cursor: new Date("2026-10-01T08:00:00Z") });
    processGeo.onSecondCall().resolves({ count: 1, failed: 0, cursor: new Date("2026-10-01T09:00:00Z") });
    await command.call(opts);

    const batches = lines().filter((l) => l.startsWith("[geo] batch"));
    assertEquals(batches.length, 2);
    assertMatch(batches[0], /batch=1 count=2 failed=1 total=2 total_failed=1 cursor=2026-10-01T08:00:00.000Z ms=/);
    assertMatch(batches[1], /batch=2 count=1 failed=0 total=3 total_failed=1 cursor=2026-10-01T09:00:00.000Z ms=/);
    assertMatch(batches[1], / per_s=\d+$/);
  });

  it("logs a summary at the end", async () => {
    processGeo.onFirstCall().resolves({ count: 2, failed: 1, cursor: new Date("2026-10-01T08:00:00Z") });
    processGeo.onSecondCall().resolves({ count: 0, failed: 0 });
    await command.call(opts);
    assertMatch(lines().at(-1)!, /^\[geo\] done batches=2 total=2 total_failed=1 ms=\d+ per_s=\d+$/);
  });
});
