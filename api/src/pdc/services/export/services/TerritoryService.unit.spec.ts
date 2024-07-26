import { assertEquals, describe, it } from "@/dev_deps.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/PostgresConnection.ts";
import { TerritoryRepository } from "@/pdc/services/export/repositories/TerritoryRepository.ts";
import { TerritoryService } from "@/pdc/services/export/services/TerritoryService.ts";
import { TerritoryCodeEnum } from "@/shared/territory/common/interfaces/TerritoryCodeInterface.ts";

describe("TerritoryService: geoStringToObject", () => {
  const connection = new PostgresConnection({});
  const repository = new TerritoryRepository(connection);
  const service = new TerritoryService(repository);

  it("should return the correct result when no params are provided", () => {
    const result = service.geoStringToObject([]);
    assertEquals(result, { [TerritoryCodeEnum.Country]: ["XXXXX"] });
  });

  it("should return the correct result when geo param is empty", () => {
    const result = service.geoStringToObject([]);
    assertEquals(result, { [TerritoryCodeEnum.Country]: ["XXXXX"] });
  });

  it("should return the correct result when code is not in the TerritoryCodeEnum list", () => {
    const result = service.geoStringToObject(["invalid_code"]);
    assertEquals(result, { [TerritoryCodeEnum.Country]: ["XXXXX"] });
  });

  it("should return the correct result when geo param is an AOM", () => {
    const result = service.geoStringToObject(["aom:code"]);
    assertEquals(result, { [TerritoryCodeEnum.Mobility]: ["CODE"] });
  });

  it("should return the correct result when geo param is many AOM", () => {
    const result = service.geoStringToObject(["aom:codeA", "aom:codeB"]);
    assertEquals(result, { [TerritoryCodeEnum.Mobility]: ["CODEA", "CODEB"] });
  });

  it("should return the correct result when geo param is an AOM and a COM", () => {
    const result = service.geoStringToObject(["aom:code", "com:code"]);
    assertEquals(result, {
      [TerritoryCodeEnum.Mobility]: ["CODE"],
      [TerritoryCodeEnum.City]: ["CODE"],
    });
  });
});

describe("TerritoryService: mergeSelectors", () => {
  const connection = new PostgresConnection({});
  const repository = new TerritoryRepository(connection);
  const service = new TerritoryService(repository);

  it("should return the correct result when no params are provided", () => {
    const result = service.mergeSelectors([]);
    assertEquals(result, {});
  });

  it("should return the correct result when only one param is provided", () => {
    const result = service.mergeSelectors([
      { [TerritoryCodeEnum.City]: ["CODE"] },
    ]);
    assertEquals(result, { [TerritoryCodeEnum.City]: ["CODE"] });
  });

  it("should return the correct result when two params are provided", () => {
    const result = service.mergeSelectors([
      { [TerritoryCodeEnum.City]: ["CODEA"] },
      { [TerritoryCodeEnum.City]: ["CODEB"] },
    ]);
    assertEquals(result, { [TerritoryCodeEnum.City]: ["CODEA", "CODEB"] });
  });

  it("should return the correct result when two params are provided with the same code", () => {
    const result = service.mergeSelectors([
      { [TerritoryCodeEnum.City]: ["CODE"] },
      { [TerritoryCodeEnum.City]: ["CODE"] },
    ]);
    assertEquals(result, { [TerritoryCodeEnum.City]: ["CODE"] });
  });

  it("should return the correct result when two params are provided with the same code and different type", () => {
    const result = service.mergeSelectors([
      { [TerritoryCodeEnum.City]: ["CODEA"] },
      { [TerritoryCodeEnum.Mobility]: ["CODEB"] },
    ]);
    assertEquals(result, {
      [TerritoryCodeEnum.City]: ["CODEA"],
      [TerritoryCodeEnum.Mobility]: ["CODEB"],
    });
  });
});
