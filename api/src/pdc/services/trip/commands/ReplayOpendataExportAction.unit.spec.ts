import { datetz } from "@/deps.ts";
import {
  afterEach,
  assertEquals,
  assertObjectMatch,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { endOfMonth, startOfMonth } from "../helpers/getDefaultDates.ts";
import { GetOldestTripDateRepositoryProvider } from "../providers/GetOldestTripRepositoryProvider.ts";
import {
  ReplayOpendataExportCommand,
  StartEndDate,
} from "./ReplayOpendataExportCommand.ts";

describe("Replay Opendata Export", () => {
  let fakeKernelInterfaceResolver: KernelInterfaceResolver;
  let getOldestTripDateRepositoryProvider: GetOldestTripDateRepositoryProvider;
  let fakeKernelInterfaceResolverStub: sinon.SinonStub;
  let getOldestTripDateRepositoryProviderStub: sinon.SinonStub;
  let replayOpendataExportCommand: ReplayOpendataExportCommand;

  beforeEach(() => {
    fakeKernelInterfaceResolver =
      new (class extends KernelInterfaceResolver {})();
    getOldestTripDateRepositoryProvider =
      new GetOldestTripDateRepositoryProvider(null as any);
    replayOpendataExportCommand = new ReplayOpendataExportCommand(
      fakeKernelInterfaceResolver,
      getOldestTripDateRepositoryProvider,
    );

    getOldestTripDateRepositoryProviderStub = sinon.stub(
      getOldestTripDateRepositoryProvider,
      "call",
    );
    fakeKernelInterfaceResolverStub = sinon.stub(
      fakeKernelInterfaceResolver,
      "call",
    );
  });

  afterEach(() => {
    fakeKernelInterfaceResolverStub.restore();
  });

  it("ReplayOpendataExportCommand: should call n times BuildExport from 08 October 2020 to Today", async () => {
    // Arrange
    getOldestTripDateRepositoryProviderStub.resolves(
      new Date("2020-10-08T15:34:52"),
    );

    // Act
    const result: StartEndDate[] = await replayOpendataExportCommand
      .call();

    // Assert
    const today: Date = new Date();
    assertObjectMatch(result[0], {
      start: datetz.fromZonedTime(
        new Date("2020-10-01T00:00:00"),
        "Europe/Paris",
      ),
      end: datetz.fromZonedTime(
        new Date("2020-10-31T23:59:59.999"),
        "Europe/Paris",
      ),
    });
    assertObjectMatch(result[7], {
      start: datetz.fromZonedTime(
        new Date("2021-05-01T00:00:00"),
        "Europe/Paris",
      ),
      end: datetz.fromZonedTime(
        new Date("2021-05-31T23:59:59.999"),
        "Europe/Paris",
      ),
    });
    assertObjectMatch(result[12], {
      start: datetz.fromZonedTime(
        new Date("2021-10-01T00:00:00"),
        "Europe/Paris",
      ),
      end: datetz.fromZonedTime(
        new Date("2021-10-31T23:59:59.999"),
        "Europe/Paris",
      ),
    });
    assertEquals(
      result[result.length - 1].start.toISOString().split("T")[0],
      startOfMonth(today, "Europe/Paris").toISOString().split("T")[0],
    );
    assertEquals(
      result[result.length - 1].end.toISOString(),
      endOfMonth(today, "Europe/Paris").toISOString(),
    );
    sinon.assert.callCount(
      fakeKernelInterfaceResolverStub,
      result.length,
    );
  });
});
