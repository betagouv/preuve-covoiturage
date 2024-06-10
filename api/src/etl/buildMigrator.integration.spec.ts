import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import { Pool } from "@/deps.ts";
import { buildMigrator } from "./buildMigrator.ts";
import { Migrator } from "./Migrator.ts";
import { EurostatCountries2020 } from "./datasets/eurostat/countries/2020/EurostatCountries2020.ts";
import { EurostatSimplifiedCountries2020 } from "./datasets/eurostat/countries/2020/EurostatSimplifiedCountries2020.ts";
import { IgnAe2019 } from "./datasets/ign/admin_express/2019/IgnAe2019.ts";
import { IgnAe2020 } from "./datasets/ign/admin_express/2020/IgnAe2020.ts";
import { IgnAe2021 } from "./datasets/ign/admin_express/2021/IgnAe2021.ts";
import { IgnAe2022 } from "./datasets/ign/admin_express/2022/IgnAe2022.ts";
import { IgnAe2023 } from "./datasets/ign/admin_express/2023/IgnAe2023.ts";
import { CreateGeoTable } from "./datastructure/000_CreateGeoTable.ts";
import { createPool } from "./helpers/index.ts";
import { InseePerim2019 } from "./datasets/insee/perimetres/2019/InseePerim2019.ts";
import { InseePerim2020 } from "./datasets/insee/perimetres/2020/InseePerim2020.ts";
import { InseePerim2021 } from "./datasets/insee/perimetres/2021/InseePerim2021.ts";
import { InseePerim2022 } from "./datasets/insee/perimetres/2022/InseePerim2022.ts";
import { InseePerim2023 } from "./datasets/insee/perimetres/2023/InseePerim2023.ts";
import { InseeDep2021 } from "./datasets/insee/departements/2021/InseeDep2021.ts";
import { InseeDep2022 } from "./datasets/insee/departements/2022/InseeDep2022.ts";
import { InseeDep2023 } from "./datasets/insee/departements/2023/InseeDep2023.ts";
import { InseeReg2021 } from "./datasets/insee/regions/2021/InseeReg2021.ts";
import { InseeReg2022 } from "./datasets/insee/regions/2022/InseeReg2022.ts";
import { InseeReg2023 } from "./datasets/insee/regions/2023/InseeReg2023.ts";
import { CeremaAom2019 } from "./datasets/cerema/aom/2019/CeremaAom2019.ts";
import { CeremaAom2020 } from "./datasets/cerema/aom/2020/CeremaAom2020.ts";
import { CeremaAom2021 } from "./datasets/cerema/aom/2021/CeremaAom2021.ts";
import { CeremaAom2022 } from "./datasets/cerema/aom/2022/CeremaAom2022.ts";
import { CeremaAom2023 } from "./datasets/cerema/aom/2023/CeremaAom2023.ts";
import { DgclBanatic2021 } from "./datasets/dgcl/banatic/2021/DgclBanatic2021.ts";
import { DgclBanatic2022 } from "./datasets/dgcl/banatic/2022/DgclBanatic2022.ts";
import { DgclBanatic2023 } from "./datasets/dgcl/banatic/2023/DgclBanatic2023.ts";
import { config } from "./config.ts";
import { CreateComEvolutionTable } from "./datastructure/001_CreateComEvolutionTable.ts";
import { InseeMvtcom2021 } from "./datasets/insee/mvt_communaux/2021/InseeMvtcom2021.ts";
import { InseeMvtcom2022 } from "./datasets/insee/mvt_communaux/2022/InseeMvtcom2022.ts";
import { InseeMvtcom2023 } from "./datasets/insee/mvt_communaux/2023/InseeMvtcom2023.ts";
import { InseeCom2021 } from "./datasets/insee/communes/2021/InseeCom2021.ts";
import { InseeCom2022 } from "./datasets/insee/communes/2022/InseeCom2022.ts";
import { InseeCom2023 } from "./datasets/insee/communes/2023/InseeCom2023.ts";
import { MemoryStateManager } from "./providers/MemoryStateManager.ts";
import { InseePays2021 } from "./datasets/insee/pays/2021/InseePays2021.ts";
import { InseePays2022 } from "./datasets/insee/pays/2022/InseePays2022.ts";
import { InseePays2023 } from "./datasets/insee/pays/2023/InseePays2023.ts";

interface TestContext {
  connection: Pool;
  migrator: Migrator;
}

const test = anyTest as TestFn<TestContext>;

beforeAll(async (t) => {
  t.context.connection = createPool();
  t.context.migrator = buildMigrator(config);
  await t.context.migrator.prepare();
  t.context.connection = t.context.migrator.pool;
  for await (
    const migrable of [
      ...t.context.migrator.config.datastructures,
      ...t.context.migrator.config.datasets,
    ]
  ) {
    await t.context.connection.query(`
        DROP TABLE IF EXISTS ${config.app.targetSchema}.${migrable.table}
      `);
  }
});

test.after.always(async (t) => {
  for await (
    const migrable of [
      ...t.context.migrator.config.datastructures,
      ...t.context.migrator.config.datasets,
    ]
  ) {
    await t.context.connection.query(`
      DROP TABLE IF EXISTS ${config.app.targetSchema}.${migrable.table}
    `);
  }
});
it("should create com_evolution table", async (t) => {
  await t.context.migrator.process(
    CreateComEvolutionTable,
    new MemoryStateManager(),
  );
  const count = await t.context.connection.query(
    `SELECT count(*) FROM com_evolution`,
  );
  assertEquals(count.rows[0].count, "0");
});

it("should do migration InseeMvtcom2021", async (t) => {
  await t.context.migrator.process(InseeMvtcom2021, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(*) FROM com_evolution where year = 2021`,
  );
  assertEquals(count.rows[0].count, "638");
});

it("should do migration InseeMvtcom2022", async (t) => {
  await t.context.migrator.process(InseeMvtcom2022, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(*) FROM com_evolution where year = 2022`,
  );
  assertEquals(count.rows[0].count, "638");
});

it("should do migration InseeMvtcom2023", async (t) => {
  await t.context.migrator.process(InseeMvtcom2023, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(*) FROM com_evolution where year = 2023`,
  );
  assertEquals(count.rows[0].count, "638");
});

it("should create perimeters table", async (t) => {
  await t.context.migrator.process(CreateGeoTable, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters`,
  );
  assertEquals(count.rows[0].count, "0");
});

it("should do migration IgnAe2019", async (t) => {
  await t.context.migrator.process(IgnAe2019, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2019 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].arr, "01001");
  assertEquals(first.rows[0].pop, 767);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2019 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].arr, "97617");
  assertEquals(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where year = 2019`,
  );
  assertEquals(count.rows[0].count, "35015");
});

it("should do migration IgnAe2020", async (t) => {
  await t.context.migrator.process(IgnAe2020, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2020 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].arr, "01001");
  assertEquals(first.rows[0].pop, 776);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2020 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].arr, "97617");
  assertEquals(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where year = 2020`,
  );
  assertEquals(count.rows[0].count, "35013");
});

it("should do migration IgnAe2021", async (t) => {
  await t.context.migrator.process(IgnAe2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].arr, "01001");
  assertEquals(first.rows[0].pop, 771);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].arr, "97617");
  assertEquals(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where year = 2021`,
  );
  assertEquals(count.rows[0].count, "35010");
});

it("should do migration IgnAe2022", async (t) => {
  await t.context.migrator.process(IgnAe2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].arr, "01001");
  assertEquals(first.rows[0].pop, 771);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].arr, "97617");
  assertEquals(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where year = 2022`,
  );
  assertEquals(count.rows[0].count, "35010");
});

it("should do migration IgnAe2023", async (t) => {
  await t.context.migrator.process(IgnAe2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].arr, "01001");
  assertEquals(first.rows[0].pop, 771);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].arr, "97617");
  assertEquals(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where year = 2023`,
  );
  assertEquals(count.rows[0].count, "35010");
});

it("should do migration EurostatCountries2020", async (t) => {
  await t.context.migrator.process(
    EurostatCountries2020,
    new MemoryStateManager(),
  );
  const count = await t.context.connection.query(
    `SELECT count(*) FROM eurostat_countries_2020`,
  );
  assertEquals(count.rows[0].count, "257");
});

it("should do migration EurostatSimplifiedCountries2020", async (t) => {
  await t.context.migrator.process(
    EurostatSimplifiedCountries2020,
    new MemoryStateManager(),
  );
  const count = await t.context.connection.query(
    `SELECT count(*) FROM eurostat_simplified_countries_2020`,
  );
  assertEquals(count.rows[0].count, "257");
});

it("should do migration InseePays2021", async (t) => {
  await t.context.migrator.process(InseePays2021, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(distinct country) 
  FROM public.perimeters where year = 2021`,
  );
  assertEquals(count.rows[0].count, "208");
});

it("should do migration InseePays2022", async (t) => {
  await t.context.migrator.process(InseePays2022, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(distinct country) FROM public.perimeters 
  where year = 2022`,
  );
  assertEquals(count.rows[0].count, "208");
});

it("should do migration InseePays2023", async (t) => {
  await t.context.migrator.process(InseePays2023, new MemoryStateManager());
  const count = await t.context.connection.query(
    `SELECT count(distinct country) FROM public.perimeters 
  where year = 2023`,
  );
  assertEquals(count.rows[0].count, "208");
});

it("should do migration Inseecom2021", async (t) => {
  await t.context.migrator.process(InseeCom2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where arr='75101' 
  and year=2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].com, "75056");
});

it("should do migration Inseecom2022", async (t) => {
  await t.context.migrator.process(InseeCom2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where arr='75101' 
  and year=2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].com, "75056");
});

it("should do migration Inseecom2023", async (t) => {
  await t.context.migrator.process(InseeCom2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where arr='75101' 
  and year=2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].com, "75056");
});

it("should do migration InseePerim2019", async (t) => {
  await t.context.migrator.process(InseePerim2019, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2019 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].dep, "01");
  assertEquals(first.rows[0].epci, "200069193");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2019 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].dep, "976");
  assertEquals(last.rows[0].epci, "200059871");
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2019`,
  );
  assertEquals(count.rows[0].count, "35015");
});

it("should do migration InseePerim2020", async (t) => {
  await t.context.migrator.process(InseePerim2020, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2020 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].dep, "01");
  assertEquals(first.rows[0].epci, "200069193");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2020 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].dep, "976");
  assertEquals(last.rows[0].epci, "200059871");
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2020`,
  );
  assertEquals(count.rows[0].count, "35013");
});

it("should do migration InseePerim2021", async (t) => {
  await t.context.migrator.process(InseePerim2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].dep, "01");
  assertEquals(first.rows[0].epci, "200069193");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].dep, "976");
  assertEquals(last.rows[0].epci, "200059871");
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2021`,
  );
  assertEquals(count.rows[0].count, "35010");
});

it("should do migration InseePerim2022", async (t) => {
  await t.context.migrator.process(InseePerim2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].dep, "01");
  assertEquals(first.rows[0].epci, "200069193");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].dep, "976");
  assertEquals(last.rows[0].epci, "200059871");
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2022`,
  );
  assertEquals(count.rows[0].count, "35010");
});

it("should do migration InseePerim2023", async (t) => {
  await t.context.migrator.process(InseePerim2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].dep, "01");
  assertEquals(first.rows[0].epci, "200069193");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].dep, "976");
  assertEquals(last.rows[0].epci, "200059871");
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2023`,
  );
  assertEquals(count.rows[0].count, "35010");
});

it("should do migration InseeDep2021", async (t) => {
  await t.context.migrator.process(InseeDep2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].l_dep, "Ain");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].l_dep, "Mayotte");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_dep) FROM perimeters where year = 2021`,
  );
  assertEquals(count.rows[0].count, "101");
});

it("should do migration InseeDep2022", async (t) => {
  await t.context.migrator.process(InseeDep2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].l_dep, "Ain");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].l_dep, "Mayotte");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_dep) FROM perimeters where year = 2022`,
  );
  assertEquals(count.rows[0].count, "101");
});

it("should do migration InseeDep2023", async (t) => {
  await t.context.migrator.process(InseeDep2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].l_dep, "Ain");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].l_dep, "Mayotte");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_dep) FROM perimeters where year = 2023`,
  );
  assertEquals(count.rows[0].count, "101");
});

it("should do migration InseeReg2021", async (t) => {
  await t.context.migrator.process(InseeReg2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].l_reg, "Auvergne-Rhône-Alpes");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].l_reg, "Mayotte");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_reg) FROM perimeters where year = 2021`,
  );
  assertEquals(count.rows[0].count, "18");
});

it("should do migration InseeReg2022", async (t) => {
  await t.context.migrator.process(InseeReg2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].l_reg, "Auvergne-Rhône-Alpes");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].l_reg, "Mayotte");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_reg) FROM perimeters where year = 2022`,
  );
  assertEquals(count.rows[0].count, "18");
});

it("should do migration InseeReg2023", async (t) => {
  await t.context.migrator.process(InseeReg2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].l_reg, "Auvergne-Rhône-Alpes");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].l_reg, "Mayotte");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_reg) FROM perimeters where year = 2023`,
  );
  assertEquals(count.rows[0].count, "18");
});

it("should do migration CeremaAom2019", async (t) => {
  await t.context.migrator.process(CeremaAom2019, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2019 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, null);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2019 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, null);
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2019`,
  );
  assertEquals(count.rows[0].count, "336");
});

it("should do migration CeremaAom2020", async (t) => {
  await t.context.migrator.process(CeremaAom2020, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2020 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, null);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2020 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, null);
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2020`,
  );
  assertEquals(count.rows[0].count, "273");
});

it("should do migration CeremaAom2021", async (t) => {
  await t.context.migrator.process(CeremaAom2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, null);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, null);
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2021`,
  );
  assertEquals(count.rows[0].count, "334");
});

it("should do migration CeremaAom2022", async (t) => {
  await t.context.migrator.process(CeremaAom2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, null);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, null);
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2022`,
  );
  assertEquals(count.rows[0].count, "334");
});

it("should do migration CeremaAom2023", async (t) => {
  await t.context.migrator.process(CeremaAom2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, null);
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, null);
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2023`,
  );
  assertEquals(count.rows[0].count, "334");
});

it("should do migration DgclBanatic2021", async (t) => {
  await t.context.migrator.process(DgclBanatic2021, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, "200053767");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, "229850003");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2021`,
  );
  assertEquals(count.rows[0].count, "739");
});

it("should do migration DgclBanatic2022", async (t) => {
  await t.context.migrator.process(DgclBanatic2022, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, "200053767");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, "229850003");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2022`,
  );
  assertEquals(count.rows[0].count, "739");
});

it("should do migration DgclBanatic2023", async (t) => {
  await t.context.migrator.process(DgclBanatic2023, new MemoryStateManager());
  const first = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`,
  );
  assertEquals(first.rows[0].aom, "200053767");
  const last = await t.context.connection.query(
    `SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`,
  );
  assertEquals(last.rows[0].aom, "229850003");
  const count = await t.context.connection.query(
    `SELECT count(distinct l_aom) FROM perimeters where year = 2023`,
  );
  assertEquals(count.rows[0].count, "739");
});

test.serial.skip("should import", async (t) => {
  await t.context.migrator.run();
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters`,
  );
  assertEquals(count.rows[0].count, "404");
});
