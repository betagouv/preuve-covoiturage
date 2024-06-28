import { assertEquals, describe, it, stub } from "@/dev_deps.ts";
import { KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { TerritoryCodeEnum } from "@/shared/territory/common/interfaces/TerritoryCodeInterface.ts";
import { TerritoryService } from "./TerritoryService.ts";

describe("territory service", () => {
  const kernel = new (class extends KernelInterfaceResolver {})();
  stub(kernel, "call");
  const service = new TerritoryService(kernel);

  it("resolve should return the correct result when no params are provided", async () => {
    const result = await service.resolve({});
    assertEquals(result, { [TerritoryCodeEnum.Country]: ["XXXXX"] });
  });

  it("resolve should return the correct result when geo param is empty", async () => {
    const result = await service.resolve({ geo: [] });
    assertEquals(result, { [TerritoryCodeEnum.Country]: ["XXXXX"] });
  });

  it("resolve should return the correct result when code is not in the TerritoryCodeEnum list", async () => {
    const result = await service.resolve({ geo: ["invalid_code"] });
    assertEquals(result, { [TerritoryCodeEnum.Country]: ["XXXXX"] });
  });

  it("resolve should return the correct result when geo param is an AOM", async () => {
    const result = await service.resolve({ geo: ["aom:code"] });
    assertEquals(result, { [TerritoryCodeEnum.Mobility]: ["CODE"] });
  });

  it("resolve should return the correct result when geo param is many AOM", async () => {
    const result = await service.resolve({ geo: ["aom:codeA", "aom:codeB"] });
    assertEquals(result, { [TerritoryCodeEnum.Mobility]: ["CODEA", "CODEB"] });
  });

  it("resolve should return the correct result when geo param is an AOM and a COM", async () => {
    const result = await service.resolve({
      geo: ["aom:code", "com:code"],
    });
    assertEquals(result, {
      [TerritoryCodeEnum.Mobility]: ["CODE"],
      [TerritoryCodeEnum.City]: ["CODE"],
    });
  });
});
