import { assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { buildMigrator } from "./buildMigrator.ts";
import { config } from "./config.ts";
import { createPool } from "./helpers/index.ts";

describe.skip("datastructure", () => {
  let connection = createPool();
  const migrator = buildMigrator(config);

  beforeAll(async () => {
    await migrator.prepare();
    connection = migrator.pool;
  });

  it("should verify no null data in perimeters table after migrations", async () => {
    const counts = await connection.query(`select
    (select count(arr) from perimeters where arr is null) as missing_arr,
    (select count(l_arr) from perimeters where l_arr is null) as missing_l_arr,
    (select count(com) from perimeters where com is null and country = 'XXXXX') as missing_com,
    (select count(l_com) from perimeters where l_com is null and country = 'XXXXX') as missing_l_com,
    (select count(epci) from perimeters where epci is null and country = 'XXXXX') as missing_epci,
    (select count(l_epci) from perimeters where l_epci is null and country = 'XXXXX') as missing_l_epci,
    (select count(aom) from perimeters where aom is null and country = 'XXXXX') as missing_aom,
    (select count(l_aom) from perimeters where l_aom is null and country = 'XXXXX') as missing_l_aom,
    (select count(dep) from perimeters where dep is null and country = 'XXXXX') as missing_dep,
    (select count(l_dep) from perimeters where l_dep is null and country = 'XXXXX') as missing_l_dep,
    (select count(reg) from perimeters where reg is null and country = 'XXXXX') as missing_reg,
    (select count(l_reg) from perimeters where l_reg is null and country = 'XXXXX') as missing_l_reg,
    (select count(country) from perimeters where country is null) as missing_country,
    (select count(l_country) from perimeters where l_country is null) as missing_l_country,
    (select count(pop) from perimeters where pop is null) as missing_pop,
    (select count(surface) from perimeters where surface is null) as missing_surface`);
    assertEquals(counts.rows[0].missing_arr, "0");
    assertEquals(counts.rows[0].missing_l_arr, "0");
    assertEquals(counts.rows[0].missing_com, "0");
    assertEquals(counts.rows[0].missing_l_com, "0");
    assertEquals(counts.rows[0].missing_epci, "0");
    assertEquals(counts.rows[0].missing_l_epci, "0");
    assertEquals(counts.rows[0].missing_aom, "0");
    assertEquals(counts.rows[0].missing_l_aom, "0");
    assertEquals(counts.rows[0].missing_dep, "0");
    assertEquals(counts.rows[0].missing_l_dep, "0");
    assertEquals(counts.rows[0].missing_reg, "0");
    assertEquals(counts.rows[0].missing_l_reg, "0");
    assertEquals(counts.rows[0].missing_country, "0");
    assertEquals(counts.rows[0].missing_l_country, "0");
    assertEquals(counts.rows[0].missing_pop, "0");
    assertEquals(counts.rows[0].missing_surface, "0");
  });
});
